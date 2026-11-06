<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\CustomerPinResetMail;
use App\Models\Customer;
use App\Models\CustomerPinResetOtp;
use App\Models\CustomerPinResetToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use RuntimeException;

class CustomerPinResetController extends Controller
{
    private const OTP_EXPIRATION_MINUTES = 5;

    private const OTP_RESEND_COOLDOWN_SECONDS = 30;

    private const OTP_MAX_ATTEMPTS = 3;

    private const RESET_TOKEN_EXPIRATION_MINUTES = 10;

    public function requestReset(Request $request): JsonResponse
    {
        $customer = $request->user();
        if (! $customer instanceof Customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya nasabah yang dapat mengubah PIN.',
            ], 403);
        }

        if (! $customer->email) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda belum memiliki email terdaftar. Hubungi petugas bank.',
            ], 422);
        }

        $delivery = $this->issueOtp($customer, 'pin');

        return response()->json([
            'status' => 'success',
            'message' => $delivery['sent']
                ? 'Kode OTP telah dikirim ke email terdaftar.'
                : 'Tunggu sebelum meminta kode OTP baru.',
            'data' => [
                'challenge_id' => $delivery['challenge_id'],
                'sent' => $delivery['sent'],
                'resend_after_seconds' => $delivery['sent']
                    ? self::OTP_RESEND_COOLDOWN_SECONDS
                    : max(
                        1,
                        self::OTP_RESEND_COOLDOWN_SECONDS
                            - now()->diffInSeconds($delivery['last_sent_at']),
                    ),
            ],
        ], $delivery['sent'] ? 202 : 429);
    }

    public function requestPasswordReset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nis' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $customer = Customer::query()
            ->where('nis', $validated['nis'])
            ->whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])
            ->first();

        $challengeId = $this->passwordChallengeId($validated['nis'], $validated['email']);
        if ($customer) {
            $challengeId = $this->issueOtp($customer, 'password', $challengeId)['challenge_id'];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Jika NIS dan email cocok, kode OTP akan dikirim atau masih dalam masa tunggu.',
            'data' => [
                'challenge_id' => $challengeId,
            ],
        ], 202);
    }

    public function requestEmailChange(Request $request): JsonResponse
    {
        $customer = $request->user();
        if (! $customer instanceof Customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya nasabah yang dapat mengubah email.',
            ], 403);
        }

        $validated = $request->validate([
            'new_email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('customers', 'email')->ignore($customer->id),
            ],
        ]);

        if (strtolower($validated['new_email']) === strtolower((string) $customer->email)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email baru harus berbeda dari email saat ini.',
            ], 422);
        }

        if (Customer::withTrashed()
            ->whereRaw('LOWER(email) = ?', [strtolower($validated['new_email'])])
            ->whereKeyNot($customer->id)
            ->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email sudah digunakan oleh nasabah lain.',
            ], 422);
        }

        $delivery = $this->issueOtp($customer, 'email', null, $validated['new_email']);

        return response()->json([
            'status' => 'success',
            'message' => $delivery['sent']
                ? 'Kode OTP telah dikirim ke email baru.'
                : 'Tunggu sebelum meminta kode OTP baru.',
            'data' => [
                'challenge_id' => $delivery['challenge_id'],
                'sent' => $delivery['sent'],
                'resend_after_seconds' => $delivery['sent']
                    ? self::OTP_RESEND_COOLDOWN_SECONDS
                    : max(
                        1,
                        self::OTP_RESEND_COOLDOWN_SECONDS
                            - now()->diffInSeconds($delivery['last_sent_at']),
                    ),
            ],
        ], $delivery['sent'] ? 202 : 429);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        return $this->verifyOtpForPurpose($request, 'pin', true);
    }

    public function verifyPasswordResetOtp(Request $request): JsonResponse
    {
        return $this->verifyOtpForPurpose($request, 'password', false);
    }

    public function verifyEmailChangeOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'challenge_id' => ['required', 'string', 'size:64', 'regex:/\A[a-f0-9]{64}\z/'],
            'otp' => ['required', 'string', 'digits:4'],
        ]);

        $customer = $request->user();
        if (! $customer instanceof Customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya nasabah yang dapat mengubah email.',
            ], 403);
        }

        $result = DB::transaction(function () use ($validated, $customer): string {
            $challenge = CustomerPinResetOtp::query()
                ->where('challenge_id', $validated['challenge_id'])
                ->where('customer_id', $customer->id)
                ->where('purpose', 'email')
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->where('attempts', '<', self::OTP_MAX_ATTEMPTS)
                ->lockForUpdate()
                ->first();

            if (! $challenge) {
                return 'invalid';
            }

            if (! hash_equals($challenge->code_hash, $this->otpHash($challenge->challenge_id, $validated['otp']))) {
                $challenge->attempts++;
                if ($challenge->attempts >= self::OTP_MAX_ATTEMPTS) {
                    $challenge->used_at = now();
                }
                $challenge->save();

                return 'invalid';
            }

            $newEmail = $challenge->pending_email;
            if (! $newEmail) {
                return 'invalid';
            }

            $emailAlreadyUsed = Customer::withTrashed()
                ->whereRaw('LOWER(email) = ?', [strtolower($newEmail)])
                ->whereKeyNot($customer->id)
                ->exists();

            $challenge->used_at = now();
            $challenge->pending_email = null;
            $challenge->save();

            if ($emailAlreadyUsed) {
                return 'email_unavailable';
            }

            $customer->email = $newEmail;
            $customer->save();
            $customer->tokens()->delete();

            return 'verified';
        });

        if ($result !== 'verified') {
            return response()->json([
                'status' => 'error',
                'message' => $result === 'email_unavailable'
                    ? 'Email sudah digunakan oleh nasabah lain. Silakan ajukan perubahan dengan email berbeda.'
                    : 'Kode OTP tidak valid, kedaluwarsa, atau sudah digunakan.',
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Email berhasil diperbarui. Silakan login kembali.',
        ]);
    }

    private function verifyOtpForPurpose(Request $request, string $purpose, bool $requiresAuthentication): JsonResponse
    {
        $validated = $request->validate([
            'challenge_id' => ['required', 'string', 'size:64', 'regex:/\A[a-f0-9]{64}\z/'],
            'otp' => ['required', 'string', 'digits:4'],
        ]);

        $customer = $request->user();
        if ($requiresAuthentication && ! $customer instanceof Customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya nasabah yang dapat mengubah PIN.',
            ], 403);
        }

        $resetToken = bin2hex(random_bytes(32));
        $verified = DB::transaction(function () use ($validated, $resetToken, $customer, $purpose): bool {
            $challenge = CustomerPinResetOtp::query()
                ->where('challenge_id', $validated['challenge_id'])
                ->where('purpose', $purpose)
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->where('attempts', '<', self::OTP_MAX_ATTEMPTS)
                ->lockForUpdate()
                ->first();

            if (! $challenge || ($customer instanceof Customer && $challenge->customer_id !== $customer->id)) {
                return false;
            }

            if (! hash_equals($challenge->code_hash, $this->otpHash($challenge->challenge_id, $validated['otp']))) {
                $challenge->attempts++;
                if ($challenge->attempts >= self::OTP_MAX_ATTEMPTS) {
                    $challenge->used_at = now();
                }
                $challenge->save();

                return false;
            }

            $challenge->used_at = now();
            $challenge->save();

            CustomerPinResetToken::query()->updateOrCreate(
                [
                    'customer_id' => $challenge->customer_id,
                    'purpose' => $purpose,
                ],
                [
                    'token_hash' => hash('sha256', $resetToken),
                    'expires_at' => now()->addMinutes(self::RESET_TOKEN_EXPIRATION_MINUTES),
                    'used_at' => null,
                ],
            );

            return true;
        });

        if (! $verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode OTP tidak valid, kedaluwarsa, atau sudah digunakan.',
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Kode OTP berhasil diverifikasi.',
            'data' => [
                'reset_token' => $resetToken,
                'expires_in_minutes' => self::RESET_TOKEN_EXPIRATION_MINUTES,
            ],
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reset_token' => ['required', 'string', 'size:64', 'regex:/\A[a-f0-9]{64}\z/'],
            'new_pin' => ['required', 'string', 'digits_between:4,6'],
        ]);

        $customer = $request->user();
        if (! $customer instanceof Customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya nasabah yang dapat mengubah PIN.',
            ], 403);
        }

        $reset = $this->consumeResetToken(
            $validated['reset_token'],
            $customer,
            'pin',
            $validated['new_pin'],
        );

        if (! $reset) {
            return response()->json([
                'status' => 'error',
                'message' => 'Otorisasi reset PIN tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'PIN berhasil diperbarui.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reset_token' => ['required', 'string', 'size:64', 'regex:/\A[a-f0-9]{64}\z/'],
            'new_password' => ['required', 'string', 'min:6'],
        ]);

        $reset = $this->consumeResetToken(
            $validated['reset_token'],
            null,
            'password',
            $validated['new_password'],
        );

        if (! $reset) {
            return response()->json([
                'status' => 'error',
                'message' => 'Otorisasi reset password tidak valid atau sudah kedaluwarsa.',
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diperbarui.',
        ]);
    }

    private function consumeResetToken(
        string $plainToken,
        ?Customer $authenticatedCustomer,
        string $purpose,
        string $newCredential,
    ): bool {
        return DB::transaction(function () use ($plainToken, $authenticatedCustomer, $purpose, $newCredential): bool {
            $resetToken = CustomerPinResetToken::query()
                ->where('token_hash', hash('sha256', $plainToken))
                ->where('purpose', $purpose)
                ->when($authenticatedCustomer, fn ($query) => $query->where('customer_id', $authenticatedCustomer->id))
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if (! $resetToken) {
                return false;
            }

            $customer = Customer::query()
                ->whereKey($resetToken->customer_id)
                ->lockForUpdate()
                ->first();

            if (! $customer || ($authenticatedCustomer && $customer->id !== $authenticatedCustomer->id)) {
                return false;
            }

            if ($purpose === 'password') {
                $customer->password = $newCredential;
            } else {
                $customer->pin = $newCredential;
            }
            $customer->save();

            $resetToken->used_at = now();
            $resetToken->save();

            return true;
        });
    }

    private function issueOtp(
        Customer $customer,
        string $purpose,
        ?string $challengeId = null,
        ?string $targetEmail = null,
    ): array {
        $challengeId ??= bin2hex(random_bytes(32));
        $delivery = ['sent' => false];
        $otp = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $targetEmail ??= $customer->email;

        DB::transaction(function () use ($customer, $purpose, $challengeId, $otp, $targetEmail, &$delivery): void {
            Customer::query()->whereKey($customer->id)->lockForUpdate()->firstOrFail();
            $currentChallenge = CustomerPinResetOtp::query()
                ->where('customer_id', $customer->id)
                ->where('purpose', $purpose)
                ->lockForUpdate()
                ->first();

            if ($currentChallenge?->last_sent_at?->gt(now()->subSeconds(self::OTP_RESEND_COOLDOWN_SECONDS))) {
                $delivery = [
                    'challenge_id' => $currentChallenge->challenge_id,
                    'last_sent_at' => $currentChallenge->last_sent_at,
                    'sent' => false,
                ];

                return;
            }

            CustomerPinResetOtp::query()->updateOrCreate(
                ['customer_id' => $customer->id, 'purpose' => $purpose],
                [
                    'challenge_id' => $challengeId,
                    'code_hash' => $this->otpHash($challengeId, $otp),
                    'pending_email' => $purpose === 'email' ? $targetEmail : null,
                    'expires_at' => now()->addMinutes(self::OTP_EXPIRATION_MINUTES),
                    'last_sent_at' => now(),
                    'attempts' => 0,
                    'used_at' => null,
                ],
            );

            CustomerPinResetToken::query()
                ->where('customer_id', $customer->id)
                ->where('purpose', $purpose)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            Mail::to($targetEmail)->send(
                new CustomerPinResetMail($otp, self::OTP_EXPIRATION_MINUTES, $purpose, $targetEmail),
            );

            $delivery = [
                'challenge_id' => $challengeId,
                'last_sent_at' => now(),
                'sent' => true,
            ];
        });

        return $delivery;
    }

    private function otpHash(string $challengeId, string $otp): string
    {
        return hash_hmac('sha256', $challengeId.':'.$otp, $this->appKey());
    }

    private function passwordChallengeId(string $nis, string $email): string
    {
        return hash_hmac(
            'sha256',
            'password:'.$nis.':'.strtolower($email),
            $this->appKey(),
        );
    }

    private function appKey(): string
    {
        $key = config('app.key');
        if (! is_string($key) || $key === '') {
            throw new RuntimeException('APP_KEY must be configured to use credential reset OTPs.');
        }

        return $key;
    }
}

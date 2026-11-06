<?php

namespace Tests\Feature;

use App\Mail\CustomerPinResetMail;
use App\Models\Customer;
use App\Models\CustomerPinResetOtp;
use App\Models\CustomerPinResetToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomerPasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.key' => 'test-password-reset-otp-key']);
    }

    public function test_matching_customer_gets_generic_response_and_password_otp_email_without_login(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();

        $response = $this->postJson('/api/customer/forgot-password', [
            'nis' => $customer->nis,
            'email' => $customer->email,
        ]);

        $response->assertAccepted()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Jika NIS dan email cocok, kode OTP akan dikirim atau masih dalam masa tunggu.');

        $challengeId = $response->json('data.challenge_id');
        $otp = null;
        Mail::assertSent(CustomerPinResetMail::class, function (CustomerPinResetMail $mail) use (&$otp, $customer): bool {
            $otp = $mail->otp;

            return $mail->purpose === 'password'
                && $mail->hasTo($customer->email)
                && str_contains($mail->envelope()->subject, 'Password')
                && preg_match('/\A\d{4}\z/', $mail->otp) === 1;
        });

        $this->assertNotNull($otp);
        $this->assertDatabaseHas('customer_pin_reset_otps', [
            'customer_id' => $customer->id,
            'purpose' => 'password',
            'challenge_id' => $challengeId,
            'code_hash' => hash_hmac('sha256', $challengeId.':'.$otp, (string) config('app.key')),
            'attempts' => 0,
            'used_at' => null,
        ]);
    }

    public function test_unknown_customer_gets_same_response_without_sending_email(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();

        $validResponse = $this->postJson('/api/customer/forgot-password', [
            'nis' => $customer->nis,
            'email' => $customer->email,
        ]);
        $unknownResponse = $this->postJson('/api/customer/forgot-password', [
            'nis' => $customer->nis,
            'email' => 'different@example.com',
        ]);
        $unknownResponseAgain = $this->postJson('/api/customer/forgot-password', [
            'nis' => $customer->nis,
            'email' => 'different@example.com',
        ]);
        $validResponseAgain = $this->postJson('/api/customer/forgot-password', [
            'nis' => $customer->nis,
            'email' => $customer->email,
        ]);

        $unknownResponse->assertAccepted()
            ->assertJsonPath('message', $validResponse->json('message'));
        $unknownResponseAgain->assertAccepted()
            ->assertJsonPath('message', $validResponse->json('message'));
        $this->assertSame(
            array_keys($validResponse->json()),
            array_keys($unknownResponse->json()),
        );
        $this->assertSame(
            $unknownResponse->json('data.challenge_id'),
            $unknownResponseAgain->json('data.challenge_id'),
        );
        $this->assertSame(
            $validResponse->json('data.challenge_id'),
            $validResponseAgain->json('data.challenge_id'),
        );
        Mail::assertSent(CustomerPinResetMail::class, 1);
    }

    public function test_password_reset_token_only_resets_password_and_cannot_reset_pin(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();

        $passwordChallenge = $this->requestPasswordOtp($customer);
        $passwordOtp = $this->sentOtp('password');
        $pinChallenge = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/change-pin/request-otp')
            ->assertAccepted()
            ->json('data.challenge_id');
        $pinOtp = $this->sentOtp('pin');

        $this->assertDatabaseCount('customer_pin_reset_otps', 2);

        $passwordResetToken = $this->postJson('/api/customer/verify-password-reset-otp', [
            'challenge_id' => $passwordChallenge,
            'otp' => $passwordOtp,
        ])->assertOk()->json('data.reset_token');

        $pinResetToken = $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/change-pin/verify-otp', [
                'challenge_id' => $pinChallenge,
                'otp' => $pinOtp,
            ])->assertOk()->json('data.reset_token');

        $this->assertDatabaseHas('customer_pin_reset_tokens', [
            'customer_id' => $customer->id,
            'purpose' => 'password',
            'token_hash' => hash('sha256', $passwordResetToken),
        ]);
        $this->assertDatabaseHas('customer_pin_reset_tokens', [
            'customer_id' => $customer->id,
            'purpose' => 'pin',
            'token_hash' => hash('sha256', $pinResetToken),
        ]);

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/change-pin/reset', [
                'reset_token' => $passwordResetToken,
                'new_pin' => '654321',
            ])->assertUnprocessable();
        $this->postJson('/api/customer/reset-password', [
            'reset_token' => $pinResetToken,
            'new_password' => 'password-baru',
        ])->assertUnprocessable();

        $this->postJson('/api/customer/reset-password', [
            'reset_token' => $passwordResetToken,
            'new_password' => 'password-baru',
        ])->assertOk()
            ->assertJsonPath('message', 'Password berhasil diperbarui.');

        $this->assertTrue(Hash::check('password-baru', $customer->fresh()->password));
        $this->assertTrue(Hash::check('123456', $customer->fresh()->pin));

        $this->postJson('/api/customer/reset-password', [
            'reset_token' => $passwordResetToken,
            'new_password' => 'password-lain',
        ])->assertUnprocessable();
    }

    public function test_password_otp_has_three_attempts_and_password_policy_is_enforced(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();
        $challengeId = $this->requestPasswordOtp($customer);
        $otp = $this->sentOtp('password');
        $incorrectOtp = $otp === '0000' ? '0001' : '0000';

        foreach (range(1, 3) as $attempt) {
            $this->postJson('/api/customer/verify-password-reset-otp', [
                'challenge_id' => $challengeId,
                'otp' => $incorrectOtp,
            ])->assertUnprocessable();
        }

        $this->assertDatabaseHas('customer_pin_reset_otps', [
            'challenge_id' => $challengeId,
            'purpose' => 'password',
            'attempts' => 3,
        ]);

        $this->postJson('/api/customer/reset-password', [
            'reset_token' => str_repeat('f', 64),
            'new_password' => '12345',
        ])->assertUnprocessable();
    }

    public function test_expired_password_otp_and_reset_token_are_rejected(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();
        $challengeId = $this->requestPasswordOtp($customer);
        CustomerPinResetOtp::query()
            ->where('challenge_id', $challengeId)
            ->where('purpose', 'password')
            ->update(['expires_at' => now()->subSecond()]);

        $this->postJson('/api/customer/verify-password-reset-otp', [
            'challenge_id' => $challengeId,
            'otp' => $this->sentOtp('password'),
        ])->assertUnprocessable();

        $resetToken = str_repeat('d', 64);
        CustomerPinResetToken::create([
            'customer_id' => $customer->id,
            'purpose' => 'password',
            'token_hash' => hash('sha256', $resetToken),
            'expires_at' => now()->subSecond(),
        ]);

        $this->postJson('/api/customer/reset-password', [
            'reset_token' => $resetToken,
            'new_password' => 'password-baru',
        ])->assertUnprocessable();

        $this->assertTrue(Hash::check('secret123', $customer->fresh()->password));
    }

    private function requestPasswordOtp(Customer $customer): string
    {
        return $this->postJson('/api/customer/forgot-password', [
            'nis' => $customer->nis,
            'email' => $customer->email,
        ])->assertAccepted()->json('data.challenge_id');
    }

    private function sentOtp(string $purpose): string
    {
        $otp = '';
        Mail::assertSent(
            CustomerPinResetMail::class,
            function (CustomerPinResetMail $mail) use (&$otp, $purpose): bool {
                if ($mail->purpose !== $purpose) {
                    return false;
                }

                $otp = $mail->otp;

                return true;
            },
        );

        return $otp;
    }

    private function createCustomer(): Customer
    {
        return Customer::create([
            'account_number' => '2026000001',
            'nis' => '12345',
            'email' => 'nasabah@example.com',
            'student_name' => 'Test Student',
            'pin' => '123456',
            'password' => 'secret123',
        ]);
    }
}

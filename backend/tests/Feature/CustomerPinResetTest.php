<?php

namespace Tests\Feature;

use App\Mail\CustomerPinResetMail;
use App\Models\Customer;
use App\Models\CustomerPinResetOtp;
use App\Models\CustomerPinResetToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class CustomerPinResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.key' => 'test-pin-reset-otp-key']);
    }

    public function test_all_otp_reset_endpoints_require_customer_authentication(): void
    {
        $this->postJson('/api/customer/change-pin/request-otp')
            ->assertUnauthorized();
        $this->postJson('/api/customer/change-pin/verify-otp', [
            'challenge_id' => str_repeat('a', 64),
            'otp' => '1234',
        ])->assertUnauthorized();
        $this->postJson('/api/customer/change-pin/reset', [
            'reset_token' => str_repeat('b', 64),
            'new_pin' => '654321',
        ])->assertUnauthorized();
    }

    public function test_authenticated_customer_receives_otp_to_their_registered_email(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();

        $response = $this->requestOtp($customer);

        $response->assertAccepted()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.sent', true)
            ->assertJsonPath('data.resend_after_seconds', 30);

        $challengeId = $response->json('data.challenge_id');
        $mail = null;
        Mail::assertSent(CustomerPinResetMail::class, function (CustomerPinResetMail $sent) use (&$mail, $customer): bool {
            $mail = $sent;

            return $sent->hasTo($customer->email)
                && preg_match('/\A\d{4}\z/', $sent->otp) === 1
                && str_contains($sent->render(), $sent->otp);
        });

        $this->assertNotNull($mail);
        $this->assertDatabaseHas('customer_pin_reset_otps', [
            'customer_id' => $customer->id,
            'challenge_id' => $challengeId,
            'code_hash' => hash_hmac('sha256', $challengeId.':'.$mail->otp, (string) config('app.key')),
            'attempts' => 0,
            'used_at' => null,
        ]);
        $this->assertDatabaseMissing('customer_pin_reset_otps', [
            'code_hash' => $mail->otp,
        ]);
    }

    public function test_customer_without_registered_email_cannot_request_otp(): void
    {
        $customer = $this->createCustomer(email: null);
        Mail::fake();

        $this->requestOtp($customer)
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Akun Anda belum memiliki email terdaftar. Hubungi petugas bank.');

        Mail::assertNothingSent();
    }

    public function test_resend_within_cooldown_returns_same_challenge_without_sending_another_email(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();

        $firstResponse = $this->requestOtp($customer);
        $firstChallengeId = $firstResponse->json('data.challenge_id');
        $firstOtp = $this->sentOtp();

        $secondResponse = $this->requestOtp($customer);
        $secondResponse->assertStatus(429)
            ->assertJsonPath('data.sent', false);
        $this->assertSame($firstChallengeId, $secondResponse->json('data.challenge_id'));
        Mail::assertSent(CustomerPinResetMail::class, 1);

        $this->travel(31)->seconds();
        $thirdResponse = $this->requestOtp($customer);
        $thirdOtp = $this->sentOtp();
        $thirdChallengeId = $thirdResponse->json('data.challenge_id');

        $this->assertNotSame($firstChallengeId, $thirdChallengeId);
        Mail::assertSent(CustomerPinResetMail::class, 2);

        $this->verifyOtp($customer, $firstChallengeId, $firstOtp)->assertUnprocessable();
        $this->verifyOtp($customer, $thirdChallengeId, $thirdOtp)->assertOk();
    }

    public function test_otp_expires_and_is_invalidated_after_three_failed_attempts(): void
    {
        $customer = $this->createCustomer();
        Mail::fake();

        $response = $this->requestOtp($customer);
        $challengeId = $response->json('data.challenge_id');
        CustomerPinResetOtp::query()->where('challenge_id', $challengeId)
            ->update(['expires_at' => now()->subSecond()]);

        $this->verifyOtp($customer, $challengeId, '0000')->assertUnprocessable();

        $this->travel(31)->seconds();
        $response = $this->requestOtp($customer);
        $challengeId = $response->json('data.challenge_id');
        $otp = $this->sentOtp();
        $incorrectOtp = $otp === '0000' ? '0001' : '0000';

        foreach (range(1, 3) as $attempt) {
            $this->verifyOtp($customer, $challengeId, $incorrectOtp)->assertUnprocessable();
        }

        $this->assertDatabaseHas('customer_pin_reset_otps', [
            'challenge_id' => $challengeId,
            'attempts' => 3,
        ]);
        $this->assertNotNull(
            CustomerPinResetOtp::query()->where('challenge_id', $challengeId)->firstOrFail()->used_at,
        );
    }

    public function test_otp_challenge_cannot_be_used_by_another_logged_in_customer(): void
    {
        $customer = $this->createCustomer();
        $otherCustomer = $this->createCustomer('2026000002', '23456', 'other@example.com');
        Mail::fake();

        $response = $this->requestOtp($customer);
        $challengeId = $response->json('data.challenge_id');
        $otp = $this->sentOtp();

        $this->verifyOtp($otherCustomer, $challengeId, $otp)->assertUnprocessable();
        $this->assertDatabaseHas('customer_pin_reset_otps', [
            'challenge_id' => $challengeId,
            'attempts' => 0,
            'used_at' => null,
        ]);
    }

    public function test_verified_otp_authorizes_one_pin_reset_only_for_the_same_customer(): void
    {
        $customer = $this->createCustomer();
        $otherCustomer = $this->createCustomer('2026000002', '23456', 'other@example.com');
        Mail::fake();
        $requestResponse = $this->requestOtp($customer);
        $challengeId = $requestResponse->json('data.challenge_id');
        $otp = $this->sentOtp();

        $verification = $this->verifyOtp($customer, $challengeId, $otp)
            ->assertOk()
            ->assertJsonPath('status', 'success');

        $resetToken = $verification->json('data.reset_token');
        $this->assertDatabaseHas('customer_pin_reset_tokens', [
            'customer_id' => $customer->id,
            'token_hash' => hash('sha256', $resetToken),
            'used_at' => null,
        ]);

        $this->resetPin($otherCustomer, $resetToken, '654321')->assertUnprocessable();
        $this->resetPin($customer, $resetToken, '654321')->assertOk()
            ->assertJsonPath('message', 'PIN berhasil diperbarui.');

        $this->assertTrue(Hash::check('654321', $customer->fresh()->pin));
        $this->assertNotNull(
            CustomerPinResetToken::query()->where('customer_id', $customer->id)->firstOrFail()->used_at,
        );

        $this->resetPin($customer, $resetToken, '123456')->assertUnprocessable();
    }

    private function requestOtp(Customer $customer): TestResponse
    {
        return $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/change-pin/request-otp');
    }

    private function verifyOtp(Customer $customer, string $challengeId, string $otp): TestResponse
    {
        return $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/change-pin/verify-otp', [
                'challenge_id' => $challengeId,
                'otp' => $otp,
            ]);
    }

    private function resetPin(Customer $customer, string $resetToken, string $newPin): TestResponse
    {
        return $this->actingAs($customer, 'sanctum')
            ->postJson('/api/customer/change-pin/reset', [
                'reset_token' => $resetToken,
                'new_pin' => $newPin,
            ]);
    }

    private function sentOtp(): string
    {
        $otp = '';
        Mail::assertSent(CustomerPinResetMail::class, function (CustomerPinResetMail $mail) use (&$otp): bool {
            $otp = $mail->otp;

            return true;
        });

        return $otp;
    }

    private function createCustomer(
        string $accountNumber = '2026000001',
        string $nis = '12345',
        ?string $email = 'nasabah@example.com',
    ): Customer {
        return Customer::create([
            'account_number' => $accountNumber,
            'nis' => $nis,
            'email' => $email,
            'student_name' => 'Test Student',
            'pin' => '123456',
            'password' => 'secret123',
        ]);
    }
}

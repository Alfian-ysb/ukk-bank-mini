<?php

namespace Tests\Feature;

use App\Mail\CustomerPinResetMail;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CustomerEmailChangeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.key' => 'test-email-change-otp-key']);
    }

    public function test_email_change_requires_customer_authentication(): void
    {
        $this->postJson('/api/customer/change-email/request-otp', [
            'new_email' => 'new@example.com',
        ])->assertUnauthorized();

        $this->postJson('/api/customer/change-email/verify-otp', [
            'challenge_id' => str_repeat('a', 64),
            'otp' => '1234',
        ])->assertUnauthorized();
    }

    public function test_otp_is_sent_to_new_email_and_email_changes_after_verification_then_customer_is_logged_out(): void
    {
        $customer = $this->createCustomer();
        $plainToken = $customer->createToken('test-token')->plainTextToken;
        $customer->createToken('another-device');
        Mail::fake();

        $request = $this->withToken($plainToken)->postJson('/api/customer/change-email/request-otp', [
            'new_email' => 'new@example.com',
        ]);
        $request->assertAccepted()
            ->assertJsonPath('data.sent', true);

        $challengeId = $request->json('data.challenge_id');
        $otp = null;
        Mail::assertSent(CustomerPinResetMail::class, function (CustomerPinResetMail $mail) use (&$otp): bool {
            $otp = $mail->otp;

            return $mail->purpose === 'email'
                && $mail->targetEmail === 'new@example.com'
                && $mail->hasTo('new@example.com')
                && preg_match('/\A\d{4}\z/', $mail->otp) === 1;
        });

        $this->assertSame('old@example.com', $customer->fresh()->email);
        $this->assertDatabaseHas('customer_pin_reset_otps', [
            'challenge_id' => $challengeId,
            'purpose' => 'email',
            'pending_email' => 'new@example.com',
        ]);

        $this->withToken($plainToken)->postJson('/api/customer/change-email/verify-otp', [
            'challenge_id' => $challengeId,
            'otp' => $otp,
        ])->assertOk()
            ->assertJsonPath('message', 'Email berhasil diperbarui. Silakan login kembali.');

        $this->assertSame('new@example.com', $customer->fresh()->email);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $customer->id,
        ]);
    }

    public function test_email_change_rejects_an_email_already_used_by_another_customer(): void
    {
        $customer = $this->createCustomer();
        $this->createCustomer('other@example.com');
        $token = $customer->createToken('test-token')->plainTextToken;
        Mail::fake();

        $this->withToken($token)->postJson('/api/customer/change-email/request-otp', [
            'new_email' => 'OTHER@example.com',
        ])->assertUnprocessable()
            ->assertJsonPath('message', 'Email sudah digunakan oleh nasabah lain.');

        Mail::assertNothingSent();
        $this->assertSame('old@example.com', $customer->fresh()->email);
    }

    public function test_invalid_email_otp_does_not_change_customer_email(): void
    {
        $customer = $this->createCustomer();
        $token = $customer->createToken('test-token')->plainTextToken;
        Mail::fake();

        $request = $this->withToken($token)->postJson('/api/customer/change-email/request-otp', [
            'new_email' => 'new@example.com',
        ]);
        $challengeId = $request->json('data.challenge_id');
        $otp = null;
        Mail::assertSent(CustomerPinResetMail::class, function (CustomerPinResetMail $mail) use (&$otp): bool {
            $otp = $mail->otp;

            return true;
        });

        $wrongOtp = $otp === '0000' ? '0001' : '0000';
        $this->withToken($token)->postJson('/api/customer/change-email/verify-otp', [
            'challenge_id' => $challengeId,
            'otp' => $wrongOtp,
        ])->assertUnprocessable();

        $this->assertSame('old@example.com', $customer->fresh()->email);
        $this->assertDatabaseHas('customer_pin_reset_otps', [
            'challenge_id' => $challengeId,
            'attempts' => 1,
        ]);
    }

    private function createCustomer(string $email = 'old@example.com'): Customer
    {
        return Customer::create([
            'account_number' => fake()->unique()->numerify('2026######'),
            'nis' => fake()->unique()->numerify('######'),
            'email' => $email,
            'student_name' => 'Test Customer',
            'pin' => bcrypt('123456'),
            'password' => bcrypt('password'),
            'status' => 'active',
            'balance' => 0,
        ]);
    }
}

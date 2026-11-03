<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Shift;
use App\Models\User;
use App\Services\FirebaseMessagingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class TransactionApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_teller_creates_pending_request_without_final_transaction(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer();
        $this->createShift($teller);

        $messaging = Mockery::mock(FirebaseMessagingService::class);
        $messaging->shouldReceive('sendToToken')->once()->andReturn('messages/1');
        $this->app->instance(FirebaseMessagingService::class, $messaging);

        $response = $this->actingAs($teller, 'sanctum')->postJson(
            "/api/teller/customer/{$customer->id}/transaction",
            ['transaction_type' => 'deposit', 'amount' => 100000],
        );

        $response->assertStatus(202)->assertJsonPath('data.status', 'pending');
        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseHas('transaction_requests', [
            'customer_id' => $customer->id,
            'status' => 'pending',
        ]);
    }

    public function test_wrong_pin_does_not_complete_request(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer();
        $shift = $this->createShift($teller);
        $request = \App\Models\TransactionRequest::create([
            'customer_id' => $customer->id,
            'user_id' => $teller->id,
            'shift_id' => $shift->id,
            'transaction_type' => 'deposit',
            'amount' => 100000,
            'status' => 'pending',
            'expires_at' => now()->addMinute(),
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson(
            "/api/customer/transaction-requests/{$request->id}/approve",
            ['pin' => '000000'],
        );

        $response->assertStatus(422);
        $this->assertDatabaseHas('transaction_requests', [
            'id' => $request->id,
            'status' => 'pending',
            'verification_attempts' => 1,
        ]);
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_transaction_is_cancelled_after_three_wrong_pins(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer();
        $shift = $this->createShift($teller);
        $request = \App\Models\TransactionRequest::create([
            'customer_id' => $customer->id,
            'user_id' => $teller->id,
            'shift_id' => $shift->id,
            'transaction_type' => 'deposit',
            'amount' => 100000,
            'status' => 'pending',
            'expires_at' => now()->addMinute(),
        ]);

        foreach (range(1, 2) as $attempt) {
            $this->actingAs($customer, 'sanctum')
                ->postJson(
                    "/api/customer/transaction-requests/{$request->id}/approve",
                    ['pin' => '000000'],
                )
                ->assertStatus(422)
                ->assertJsonPath('errors.pin.0', "PIN tidak valid. Sisa percobaan: ".(3 - $attempt).".");
        }

        $this->actingAs($customer, 'sanctum')
            ->postJson(
                "/api/customer/transaction-requests/{$request->id}/approve",
                ['pin' => '000000'],
            )
            ->assertStatus(409)
            ->assertJsonPath('message', 'Transaksi dibatalkan karena PIN salah 3 kali.');

        $this->assertDatabaseHas('transaction_requests', [
            'id' => $request->id,
            'status' => 'rejected',
            'verification_attempts' => 3,
        ]);
        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_correct_pin_completes_request_once(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer();
        $shift = $this->createShift($teller);
        $request = \App\Models\TransactionRequest::create([
            'customer_id' => $customer->id,
            'user_id' => $teller->id,
            'shift_id' => $shift->id,
            'transaction_type' => 'deposit',
            'amount' => 100000,
            'status' => 'pending',
            'expires_at' => now()->addMinute(),
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson(
            "/api/customer/transaction-requests/{$request->id}/approve",
            ['pin' => '123456'],
        );

        $response->assertOk()->assertJsonPath('data.status', 'completed');
        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'balance' => 100000]);
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseCount('accounting_journals', 2);
    }

    private function createUser(string $role): User
    {
        return User::create([
            'username' => $role . '-' . fake()->unique()->numerify('###'),
            'full_name' => ucfirst($role),
            'password' => bcrypt('password'),
            'role' => $role,
        ]);
    }

    private function createCustomer(): Customer
    {
        return Customer::create([
            'account_number' => fake()->unique()->numerify('2026######'),
            'nis' => fake()->unique()->numerify('######'),
            'student_name' => 'Test Customer',
            'pin' => bcrypt('123456'),
            'password' => bcrypt('password'),
            'status' => 'active',
            'balance' => 0,
        ]);
    }

    private function createShift(User $teller): Shift
    {
        return Shift::create([
            'shift_date' => now()->toDateString(),
            'status' => 'open',
            'opening_balance' => 1000000,
            'assigned_staff' => [$teller->id],
            'opened_by' => $teller->id,
        ]);
    }
}

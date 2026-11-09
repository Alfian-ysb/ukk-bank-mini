<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\General;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_withdrawal_below_minimum_is_rejected(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer(200000);
        $this->setWithdrawalLimits();

        $response = $this->actingAs($teller, 'sanctum')->postJson(
            "/api/teller/customer/{$customer->id}/transaction",
            ['transaction_type' => 'withdrawal', 'amount' => 9999],
        );

        $response->assertUnprocessable()
            ->assertJsonPath('errors.amount.0', 'Jumlah penarikan minimal adalah Rp10000.');
        $this->assertDatabaseCount('transaction_requests', 0);
    }

    public function test_withdrawal_above_maximum_is_rejected(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer(2000000);
        $this->setWithdrawalLimits();

        $response = $this->actingAs($teller, 'sanctum')->postJson(
            "/api/teller/customer/{$customer->id}/transaction",
            ['transaction_type' => 'withdrawal', 'amount' => 1000001],
        );

        $response->assertUnprocessable()
            ->assertJsonPath('errors.amount.0', 'Jumlah penarikan maksimal adalah Rp1000000.');
        $this->assertDatabaseCount('transaction_requests', 0);
    }

    public function test_teller_processes_deposit_without_customer_approval(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer();
        $this->createShift($teller);

        $response = $this->actingAs($teller, 'sanctum')->postJson(
            "/api/teller/customer/{$customer->id}/transaction",
            ['transaction_type' => 'deposit', 'amount' => 100000],
        );

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.customer_balance', 100000);
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseHas('transaction_requests', [
            'customer_id' => $customer->id,
            'status' => 'completed',
        ]);
    }

    public function test_wrong_pin_does_not_complete_request(): void
    {
        $teller = $this->createUser('teller');
        $customer = $this->createCustomer(200000);
        $shift = $this->createShift($teller);
        $request = \App\Models\TransactionRequest::create([
            'customer_id' => $customer->id,
            'user_id' => $teller->id,
            'shift_id' => $shift->id,
            'transaction_type' => 'withdrawal',
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
        $customer = $this->createCustomer(200000);
        $shift = $this->createShift($teller);
        $request = \App\Models\TransactionRequest::create([
            'customer_id' => $customer->id,
            'user_id' => $teller->id,
            'shift_id' => $shift->id,
            'transaction_type' => 'withdrawal',
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

    public function test_deposit_completes_without_pin(): void
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
            [],
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

    private function createCustomer(int $balance = 0): Customer
    {
        return Customer::create([
            'account_number' => fake()->unique()->numerify('2026######'),
            'nis' => fake()->unique()->numerify('######'),
            'student_name' => 'Test Customer',
            'pin' => bcrypt('123456'),
            'password' => bcrypt('password'),
            'status' => 'active',
            'balance' => $balance,
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

    private function setWithdrawalLimits(): void
    {
        General::create(['name' => 'minimum_withdrawal', 'value' => '10000']);
        General::create(['name' => 'max_withdrawal', 'value' => '1000000']);
    }
}

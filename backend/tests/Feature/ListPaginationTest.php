<?php

namespace Tests\Feature;

use App\Models\AccountingJournal;
use App\Models\Customer;
use App\Models\Shift;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ListPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_lists_and_supervisor_daily_reports_are_paginated(): void
    {
        $admin = $this->createUser('admin');
        $this->createUser('teller');
        $this->createUser('supervisor');
        $customers = [$this->createCustomer(1), $this->createCustomer(2)];
        $shift = Shift::create([
            'shift_date' => now()->toDateString(),
            'status' => 'open',
            'opening_balance' => 100000,
            'assigned_staff' => [],
            'opened_by' => User::where('role', 'teller')->value('id'),
        ]);
        Shift::create([
            'shift_date' => now()->subDay()->toDateString(),
            'status' => 'closed',
            'opening_balance' => 100000,
            'assigned_staff' => [],
            'opened_by' => $shift->opened_by,
        ]);

        foreach ($customers as $customer) {
            $transaction = Transaction::create([
                'customer_id' => $customer->id,
                'user_id' => $shift->opened_by,
                'shift_id' => $shift->id,
                'date' => now(),
                'transaction_type' => 'deposit',
                'amount' => 10000,
            ]);
            AccountingJournal::create([
                'transaction_id' => $transaction->id,
                'account_code' => '101',
                'position' => 'debit',
                'amount' => 10000,
            ]);
        }

        $this->actingAs($admin, 'sanctum');

        $this->getJson('/api/admin/customers?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.current_page', 1)
            ->assertJsonPath('pagination.per_page', 1)
            ->assertJsonPath('pagination.total', 2)
            ->assertJsonPath('pagination.last_page', 2);

        $this->getJson('/api/admin/staff?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.total', 3)
            ->assertJsonPath('pagination.last_page', 3);

        $this->getJson('/api/admin/transactions?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.total', 2)
            ->assertJsonPath('pagination.last_page', 2);

        $this->getJson('/api/admin/journals?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.total', 2)
            ->assertJsonPath('pagination.last_page', 2);

        $this->actingAs(User::where('role', 'supervisor')->first(), 'sanctum');

        $this->getJson('/api/supervisor/shifts?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.current_page', 1)
            ->assertJsonPath('pagination.per_page', 1)
            ->assertJsonPath('pagination.total', 2)
            ->assertJsonPath('pagination.last_page', 2);

        $this->getJson('/api/supervisor/shifts?per_page=1&status=closed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.total', 1)
            ->assertJsonPath('pagination.last_page', 1);
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

    private function createCustomer(int $number): Customer
    {
        return Customer::create([
            'account_number' => '2026' . str_pad((string) $number, 6, '0', STR_PAD_LEFT),
            'nis' => 'nis-' . $number,
            'student_name' => 'Test Customer ' . $number,
            'pin' => bcrypt('123456'),
            'password' => bcrypt('password'),
            'status' => 'active',
            'balance' => 100000,
        ]);
    }
}

<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_customers()
    {
        Customer::create([
            'account_number' => '2026000001',
            'nis' => '12345',
            'student_name' => 'Test Student',
            'class' => 'X-A',
            'pin' => bcrypt('123456'),
            'password' => bcrypt('secret123'),
            'status' => 'active',
            'balance' => 0,
        ]);

        $response = $this->getJson('/api/admin/customers');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data',
                 ]);
    }

    public function test_create_customer_endpoint()
    {
        $payload = [
            'nis' => '99999',
            'student_name' => 'New Student',
            'class' => 'XI-B',
            'pin' => '654321',
            'password' => 'password',
        ];

        $response = $this->postJson('/api/admin/customers', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonPath('data.nis', $payload['nis']);

        $this->assertDatabaseHas('customers', ['nis' => $payload['nis']]);
    }

    public function test_view_customer_not_found_returns_404()
    {
        $response = $this->getJson('/api/admin/customers/999');

        $response->assertStatus(404)
                 ->assertJsonPath('status', 'error');
    }
}

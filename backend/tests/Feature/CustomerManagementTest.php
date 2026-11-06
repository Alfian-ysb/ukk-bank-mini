<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

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

    public function test_import_customers_accepts_optional_email_and_saves_it_when_provided()
    {
        $this->actingAs($this->createAdmin(), 'sanctum');
        $file = UploadedFile::fake()->createWithContent(
            'customers.csv',
            implode("\n", [
                'nis;student_name;email;major;cohort_year;pin;password',
                '10001;Student With Email;student@example.com;RPL;2026;123456;password123',
                '10002;Student Without Email;;RPL;2026;123456;password123',
            ]),
        );

        $response = $this->postJson('/api/admin/customers/import', ['file' => $file]);

        $response->assertOk()
            ->assertJsonPath('data.imported', 2);

        $this->assertDatabaseHas('customers', [
            'nis' => '10001',
            'email' => 'student@example.com',
        ]);
        $this->assertDatabaseHas('customers', [
            'nis' => '10002',
            'email' => null,
        ]);
    }

    public function test_import_customers_accepts_csv_without_email_column()
    {
        $this->actingAs($this->createAdmin(), 'sanctum');
        $file = UploadedFile::fake()->createWithContent(
            'customers.csv',
            implode("\n", [
                'nis,student_name,major,cohort_year,pin,password',
                '10003,Student Without Email Column,RPL,2026,123456,password123',
            ]),
        );

        $response = $this->postJson('/api/admin/customers/import', ['file' => $file]);

        $response->assertOk()
            ->assertJsonPath('data.imported', 1);

        $this->assertDatabaseHas('customers', [
            'nis' => '10003',
            'email' => null,
        ]);
    }

    private function createAdmin(): User
    {
        return User::create([
            'username' => 'admin-import',
            'full_name' => 'Admin Import',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShiftOpeningValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_shift_cannot_be_opened_without_denominations(): void
    {
        $teller = $this->createTeller();

        $this->actingAs($teller, 'sanctum')
            ->postJson('/api/teller/shifts/open', [
                'assigned_staff' => [$teller->id],
                'opening_denominations' => [],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('opening_denominations');

        $this->assertDatabaseCount('shifts', 0);
    }

    public function test_shift_cannot_be_opened_when_all_denominations_have_zero_quantity(): void
    {
        $teller = $this->createTeller();

        $this->actingAs($teller, 'sanctum')
            ->postJson('/api/teller/shifts/open', [
                'assigned_staff' => [$teller->id],
                'opening_denominations' => [
                    ['denomination' => 50000, 'quantity' => 0],
                    ['denomination' => 10000, 'quantity' => 0],
                ],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('opening_denominations');

        $this->assertDatabaseCount('shifts', 0);
    }

    private function createTeller(): User
    {
        return User::create([
            'username' => 'teller-' . fake()->unique()->numerify('###'),
            'full_name' => 'Test Teller',
            'password' => bcrypt('password'),
            'role' => 'teller',
        ]);
    }
}

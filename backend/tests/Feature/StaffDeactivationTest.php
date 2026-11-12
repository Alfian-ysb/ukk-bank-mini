<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffDeactivationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_deactivate_staff_without_deleting_the_record(): void
    {
        $admin = $this->createUser('admin');
        $staff = $this->createUser('teller');
        $staff->createToken('staff-session');
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/staff/{$staff->id}/deactivate")
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Staff berhasil dinonaktifkan.');

        $this->assertSoftDeleted('users', ['id' => $staff->id]);
        $this->assertDatabaseHas('users', ['id' => $staff->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $staff->id]);
        $this->getJson('/api/admin/staff')
            ->assertOk()
            ->assertJsonPath('data.1.is_active', false);
        $this->getJson("/api/admin/staff/{$staff->id}")
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_can_reactivate_a_deactivated_staff_member(): void
    {
        $admin = $this->createUser('admin');
        $staff = $this->createUser('teller');
        $staff->delete();
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/staff/{$staff->id}/activate")
            ->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $staff->id)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'deleted_at' => null,
        ]);
    }

    public function test_admin_cannot_reactivate_an_already_active_staff_member(): void
    {
        $admin = $this->createUser('admin');
        $staff = $this->createUser('teller');
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/staff/{$staff->id}/activate")
            ->assertStatus(409)
            ->assertJsonPath('status', 'error');
    }

    public function test_admin_cannot_deactivate_their_own_account(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/staff/{$admin->id}/deactivate")
            ->assertForbidden()
            ->assertJsonPath('status', 'error');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'deleted_at' => null,
        ]);
    }

    public function test_admin_can_deactivate_another_admin_when_two_are_active(): void
    {
        $admin = $this->createUser('admin');
        $otherAdmin = $this->createUser('admin');
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/staff/{$otherAdmin->id}/deactivate")
            ->assertOk();

        $this->assertSoftDeleted('users', ['id' => $otherAdmin->id]);
        $this->assertSame(1, User::where('role', 'admin')->count());
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'deleted_at' => null,
        ]);
    }

    public function test_admin_cannot_change_their_own_role_to_non_admin(): void
    {
        $admin = $this->createUser('admin');
        $this->actingAs($admin, 'sanctum');

        $this->patchJson("/api/admin/staff/{$admin->id}", ['role' => 'teller'])
            ->assertForbidden()
            ->assertJsonPath('status', 'error');

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'role' => 'admin',
        ]);
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
}

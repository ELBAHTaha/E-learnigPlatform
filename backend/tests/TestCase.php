<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /** Seed roles & permissions (required for almost every endpoint). */
    protected function seedRoles(): void
    {
        $this->seed(RolePermissionSeeder::class);
    }

    /** Create a user with the given role. */
    protected function userWithRole(string $role, array $attrs = []): User
    {
        $user = User::factory()->create($attrs);
        $user->assignRole($role);

        return $user;
    }
}

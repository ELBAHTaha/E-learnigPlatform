<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    // NOTE: admins are granted everything via Gate::before in AppServiceProvider.

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermissionTo('users.view') || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('users.manage');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasPermissionTo('users.manage');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasPermissionTo('users.manage') && $user->id !== $model->id;
    }
}

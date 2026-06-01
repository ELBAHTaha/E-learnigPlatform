<?php

namespace App\Policies;

use App\Models\ClassSession;
use App\Models\User;

class ClassSessionPolicy
{
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('sessions.manage');
    }

    public function update(User $user, ClassSession $session): bool
    {
        if (! $user->hasPermissionTo('sessions.manage')) {
            return false;
        }

        // Formateurs may only manage their own sessions.
        return $user->hasRole('admin') || $session->formateur_id === $user->id;
    }

    public function delete(User $user, ClassSession $session): bool
    {
        return $this->update($user, $session);
    }

    public function createMeeting(User $user, ClassSession $session): bool
    {
        return $user->hasPermissionTo('sessions.create_meeting')
            && ($user->hasRole('admin') || $session->formateur_id === $user->id);
    }
}

<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;

class EnrollmentPolicy
{
    public function view(User $user, Enrollment $enrollment): bool
    {
        return $user->hasPermissionTo('enrollments.decide') || $enrollment->eleve_id === $user->id;
    }

    public function decide(User $user, Enrollment $enrollment): bool
    {
        return $user->hasPermissionTo('enrollments.decide');
    }
}

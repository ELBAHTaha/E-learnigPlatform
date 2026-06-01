<?php

namespace App\Policies;

use App\Models\Formation;
use App\Models\Grade;
use App\Models\User;

class GradePolicy
{
    /** Trainers may only enter/manage grades for formations they teach. */
    public function manageForFormation(User $user, Formation $formation): bool
    {
        if (! $user->hasPermissionTo('grades.manage')) {
            return false;
        }

        return $user->hasRole('admin') || $formation->formateur_id === $user->id;
    }

    public function delete(User $user, Grade $grade): bool
    {
        return $this->manageForFormation($user, $grade->formation);
    }
}

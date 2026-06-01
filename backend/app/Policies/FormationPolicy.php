<?php

namespace App\Policies;

use App\Models\Formation;
use App\Models\User;

class FormationPolicy
{
    public function viewAny(?User $user): bool
    {
        return true; // public catalogue
    }

    public function view(?User $user, Formation $formation): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('formations.manage');
    }

    public function update(User $user, Formation $formation): bool
    {
        return $user->hasPermissionTo('formations.manage');
    }

    public function delete(User $user, Formation $formation): bool
    {
        return $user->hasPermissionTo('formations.manage');
    }
}

<?php

namespace App\Policies;

use App\Models\ImmigrationDossier;
use App\Models\User;

class ImmigrationDossierPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('immigration.manage') || $user->hasPermissionTo('immigration.view_own');
    }

    public function view(User $user, ImmigrationDossier $dossier): bool
    {
        return $user->hasPermissionTo('immigration.manage') || $dossier->eleve_id === $user->id;
    }

    public function manage(User $user, ImmigrationDossier $dossier): bool
    {
        return $user->hasPermissionTo('immigration.manage');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('immigration.manage') || $user->hasPermissionTo('immigration.view_own');
    }
}

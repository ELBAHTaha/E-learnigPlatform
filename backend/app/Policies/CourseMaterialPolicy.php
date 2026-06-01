<?php

namespace App\Policies;

use App\Models\CourseMaterial;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\User;

class CourseMaterialPolicy
{
    public function createForFormation(User $user, Formation $formation): bool
    {
        if (! $user->hasPermissionTo('materials.manage')) {
            return false;
        }

        // Formateurs may only manage materials for formations they teach.
        return $user->hasRole('admin') || $formation->formateur_id === $user->id;
    }

    public function update(User $user, CourseMaterial $material): bool
    {
        return $this->createForFormation($user, $material->formation);
    }

    public function delete(User $user, CourseMaterial $material): bool
    {
        return $this->createForFormation($user, $material->formation);
    }

    /** Who may download the underlying file (corrigés / private assets are gated). */
    public function download(User $user, CourseMaterial $material): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($material->formation->formateur_id === $user->id) {
            return true;
        }

        if (! $material->isRestricted()) {
            // Non-restricted public materials: any authenticated user.
            return true;
        }

        // Restricted (corrigé / private): student must have an approved enrollment.
        return Enrollment::where('eleve_id', $user->id)
            ->where('formation_id', $material->formation_id)
            ->where('status', Enrollment::APPROVED)
            ->exists();
    }
}

<?php

namespace App\Policies;

use App\Models\Room;
use App\Models\User;

class RoomPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // any authenticated user can see rooms (for the schedule)
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('rooms.manage');
    }

    public function update(User $user, Room $room): bool
    {
        return $user->hasPermissionTo('rooms.manage');
    }

    public function delete(User $user, Room $room): bool
    {
        return $user->hasPermissionTo('rooms.manage');
    }
}

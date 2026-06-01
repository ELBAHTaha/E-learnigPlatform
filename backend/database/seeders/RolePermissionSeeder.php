<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Roles match the frontend contract: admin | formateur | eleve | conseiller.
     * ("conseiller" is the immigration advisor — labelled "Conseiller immigration".)
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // users
            'users.view', 'users.manage',
            // formations / catalogue
            'formations.view', 'formations.manage',
            // course materials
            'materials.view', 'materials.manage', 'materials.download_restricted',
            // enrollments
            'enrollments.request', 'enrollments.view', 'enrollments.decide',
            // schedule / sessions
            'sessions.view', 'sessions.manage', 'sessions.create_meeting',
            // rooms
            'rooms.view', 'rooms.manage',
            // assessments & grades
            'grades.view', 'grades.manage',
            // announcements
            'announcements.view', 'announcements.manage',
            // immigration
            'immigration.view_own', 'immigration.manage',
            // chatbot
            'chatbot.use',
            // stats
            'stats.view',
        ];

        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $roles = [
            'admin' => $permissions, // everything
            'formateur' => [
                'formations.view', 'materials.view', 'materials.manage', 'materials.download_restricted',
                'enrollments.view', 'sessions.view', 'sessions.manage', 'sessions.create_meeting',
                'rooms.view', 'grades.view', 'grades.manage', 'announcements.view', 'chatbot.use',
            ],
            'eleve' => [
                'formations.view', 'materials.view', 'materials.download_restricted',
                'enrollments.request', 'enrollments.view', 'sessions.view',
                'grades.view', 'announcements.view', 'immigration.view_own', 'chatbot.use',
            ],
            'conseiller' => [
                'formations.view', 'enrollments.view', 'announcements.view',
                'immigration.view_own', 'immigration.manage', 'chatbot.use',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($rolePermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}

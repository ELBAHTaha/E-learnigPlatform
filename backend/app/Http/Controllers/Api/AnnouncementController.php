<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use App\Models\User;
use App\Notifications\NewAnnouncement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Notification;

class AnnouncementController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        // Filter to announcements visible to the requested/viewer role.
        $role = $request->string('role')->toString() ?: $request->user()?->roles->first()?->name;

        $announcements = Announcement::query()
            ->where('is_published', true)
            ->when($role, function ($q) use ($role) {
                // visible if no targets (everyone) OR target_roles JSON contains the role
                $q->where(function ($w) use ($role) {
                    $w->whereNull('target_roles')
                        ->orWhere('target_roles', '[]')
                        ->orWhereJsonContains('target_roles', $role);
                });
            })
            ->orderByDesc('pinned')
            ->orderByDesc('published_at')
            ->get();

        return AnnouncementResource::collection($announcements);
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::create([
            'author_id' => $request->user()->id,
            'author_name' => $request->input('author') ?: $request->user()->fullName(),
            'title' => $request->input('title'),
            'body' => $request->input('body'),
            'target_roles' => $request->targetRoles(),
            'is_published' => true,
            'pinned' => $request->boolean('pinned'),
            'published_at' => now(),
        ]);

        $this->notifyAudience($announcement);

        return (new AnnouncementResource($announcement))->response()->setStatusCode(201);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $this->authorize('delete', $announcement);
        $announcement->delete();

        return response()->json(null, 204);
    }

    /** POST /announcements/{announcement}/publish */
    public function publish(Announcement $announcement): AnnouncementResource
    {
        $this->authorize('update', $announcement);

        $announcement->update(['is_published' => true, 'published_at' => $announcement->published_at ?? now()]);
        $this->notifyAudience($announcement);

        return new AnnouncementResource($announcement);
    }

    /** Send an in-app notification to every user in the target audience. */
    private function notifyAudience(Announcement $announcement): void
    {
        $roles = $announcement->target_roles;

        $users = User::query()
            ->when($roles, fn ($q) => $q->whereHas('roles', fn ($r) => $r->whereIn('name', $roles)))
            ->get();

        if ($users->isNotEmpty()) {
            Notification::send($users, new NewAnnouncement($announcement));
        }
    }
}

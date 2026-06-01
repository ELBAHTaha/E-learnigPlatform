<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Formation;
use App\Models\ImmigrationDossier;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermissionTo('stats.view'), 403);

        $startOfMonth = Carbon::now()->startOfMonth();

        $byRole = fn (string $role) => User::whereHas('roles', fn ($q) => $q->where('name', $role))->count();

        // Enrollments per month over the last 6 months (for charts).
        $enrollmentsSeries = collect(range(5, 0))->map(function ($monthsAgo) {
            $month = Carbon::now()->subMonths($monthsAgo);

            return [
                'month' => $month->format('Y-m'),
                'label' => $month->locale('fr')->isoFormat('MMM YYYY'),
                'count' => Enrollment::whereYear('requested_at', $month->year)
                    ->whereMonth('requested_at', $month->month)->count(),
            ];
        })->values();

        $formationsByPole = Formation::query()
            ->join('poles', 'formations.pole_id', '=', 'poles.id')
            ->select('poles.slug', 'poles.label', DB::raw('count(*) as count'))
            ->groupBy('poles.slug', 'poles.label')
            ->get();

        $dossiersByStatus = ImmigrationDossier::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')->get();

        $enrollmentsByStatus = Enrollment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')->get();

        return response()->json([
            'counts' => [
                'eleves' => $byRole('eleve'),
                'formateurs' => $byRole('formateur'),
                'conseillers' => $byRole('conseiller'),
                'formationsActives' => Formation::where('is_active', true)->count(),
                'formationsTotal' => Formation::count(),
                'inscriptionsDuMois' => Enrollment::where('requested_at', '>=', $startOfMonth)->count(),
                'inscriptionsEnAttente' => Enrollment::where('status', Enrollment::PENDING)->count(),
                'dossiersActifs' => ImmigrationDossier::whereNotIn('status', ['finalise', 'rejete'])->count(),
            ],
            'series' => [
                'enrollmentsPerMonth' => $enrollmentsSeries,
                'formationsByPole' => $formationsByPole,
                'dossiersByStatus' => $dossiersByStatus,
                'enrollmentsByStatus' => $enrollmentsByStatus,
            ],
        ]);
    }
}

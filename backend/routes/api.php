<?php

use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\CourseMaterialController;
use App\Http\Controllers\Api\DossierController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\FormationController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\ImmigrationDocumentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PoleController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AFG Académie — API
|--------------------------------------------------------------------------
| Served under the /api prefix. The React SPA points VITE_API_BASE_URL here
| and consumes bare JSON. Routes mirror the frontend api/* client exactly;
| spec-style aliases (/immigration/*, /formations/{id}/materials, …) are
| provided alongside.
*/

// ============================ Authentication ============================
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// ============================ Public catalogue ==========================
Route::get('poles', [PoleController::class, 'index']);
Route::get('categories', [PoleController::class, 'categories']);
Route::get('formations', [FormationController::class, 'index']);
Route::get('formations/{formation}', [FormationController::class, 'show'])->where('formation', '[A-Za-z0-9\-]+');

// ============================ Chatbot (public, rate-limited) ============
Route::middleware('throttle:chatbot')->prefix('chatbot')->group(function () {
    Route::post('message', [ChatbotController::class, 'message']);
    Route::post('contact', [ChatbotController::class, 'contact']);
});

// ============================ Authenticated =============================
Route::middleware('auth:sanctum')->group(function () {

    // ---- Profile ----
    Route::get('profile', [ProfileController::class, 'show']);
    Route::match(['put', 'patch'], 'profile', [ProfileController::class, 'update']);
    Route::post('profile/avatar', [ProfileController::class, 'avatar']);

    // ---- Notifications ----
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);

    // ---- Users (admin) ----
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::match(['put', 'patch'], 'users/{user}', [UserController::class, 'update']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);
    Route::put('users/{user}/status', [UserController::class, 'updateStatus']);

    // ---- Formations (admin write) ----
    Route::post('formations', [FormationController::class, 'store']);
    Route::match(['put', 'patch'], 'formations/{formation}', [FormationController::class, 'update']);
    Route::delete('formations/{formation}', [FormationController::class, 'destroy']);

    // ---- Course materials / resources ----
    Route::get('resources', [CourseMaterialController::class, 'index']);
    Route::post('resources', [CourseMaterialController::class, 'store']);
    Route::delete('resources/{material}', [CourseMaterialController::class, 'destroy']);
    Route::get('formations/{formation}/materials', [CourseMaterialController::class, 'index']);
    Route::post('formations/{formation}/materials', [CourseMaterialController::class, 'store']);
    Route::delete('materials/{material}', [CourseMaterialController::class, 'destroy']);
    Route::get('materials/{material}/download', [CourseMaterialController::class, 'download']);

    // ---- Enrollments ----
    Route::get('enrollments', [EnrollmentController::class, 'index']);
    Route::post('enrollments', [EnrollmentController::class, 'store']);
    Route::post('enrollments/{enrollment}/decide', [EnrollmentController::class, 'decide']);
    Route::put('enrollments/{enrollment}/decision', [EnrollmentController::class, 'decide']); // spec alias
    Route::get('me/formations', [EnrollmentController::class, 'myFormations']);

    // ---- Rooms ----
    Route::get('rooms', [RoomController::class, 'index']);
    Route::post('rooms', [RoomController::class, 'store']);
    Route::match(['put', 'patch'], 'rooms/{room}', [RoomController::class, 'update']);
    Route::delete('rooms/{room}', [RoomController::class, 'destroy']);

    // ---- Schedule / sessions ----
    Route::get('sessions', [SessionController::class, 'index']);
    Route::post('sessions', [SessionController::class, 'store']);
    Route::match(['put', 'patch'], 'sessions/{session}', [SessionController::class, 'update']);
    Route::delete('sessions/{session}', [SessionController::class, 'destroy']);
    Route::post('sessions/{session}/meeting', [SessionController::class, 'createMeeting']);
    Route::get('sessions/{session}/join', [SessionController::class, 'join']);

    // ---- Assessments & grades ----
    Route::get('assessments', [AssessmentController::class, 'index']);
    Route::post('assessments', [AssessmentController::class, 'store']);
    Route::get('grades', [GradeController::class, 'index']);
    Route::post('grades', [GradeController::class, 'store']);
    Route::delete('grades/{grade}', [GradeController::class, 'destroy']);
    Route::get('me/grades', [GradeController::class, 'myGrades']);

    // ---- Announcements ----
    Route::get('announcements', [AnnouncementController::class, 'index']);
    Route::post('announcements', [AnnouncementController::class, 'store']);
    Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    Route::post('announcements/{announcement}/publish', [AnnouncementController::class, 'publish']);

    // ---- Immigration (frontend uses /dossiers*; /immigration/* are spec aliases) ----
    foreach (['dossiers', 'immigration/dossiers'] as $prefix) {
        Route::get($prefix, [DossierController::class, 'index']);
        Route::post($prefix, [DossierController::class, 'store']);
        Route::get($prefix.'/{dossier}', [DossierController::class, 'show']);
        Route::match(['put', 'patch'], $prefix.'/{dossier}', [DossierController::class, 'updateStatus']);
        Route::post($prefix.'/{dossier}/status', [DossierController::class, 'updateStatus']);
        Route::put($prefix.'/{dossier}/status', [DossierController::class, 'updateStatus']);
        Route::get($prefix.'/{dossier}/messages', [DossierController::class, 'messages']);
        Route::post($prefix.'/{dossier}/messages', [DossierController::class, 'addMessage']);
        Route::post($prefix.'/{dossier}/notes', [DossierController::class, 'addMessage']);
        Route::post($prefix.'/{dossier}/documents', [DossierController::class, 'addDocument']);
        Route::patch($prefix.'/{dossier}/documents/{document}', [DossierController::class, 'toggleDocument']);
    }
    Route::post('documents/{document}/upload', [ImmigrationDocumentController::class, 'upload']);
    Route::put('documents/{document}/verify', [ImmigrationDocumentController::class, 'verify']);
    Route::get('documents/{document}/download', [ImmigrationDocumentController::class, 'download']);

    // ---- Admin stats ----
    Route::get('stats/overview', [StatsController::class, 'overview']);
});

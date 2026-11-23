
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PermitController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\PdfController;
use App\Http\Controllers\Api\PermitEvidenceController;
use App\Http\Controllers\Api\PermitCompletionController;
use App\Http\Controllers\Api\ApprovalTargetController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\ArchiveController;

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'active.user'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | User Profile and Authentication
    |--------------------------------------------------------------------------
    */

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    /*
    |--------------------------------------------------------------------------
    | Admin System - User Management
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/users', [
        UserController::class,
        'index',
    ])->middleware('permission:manage_users');

    Route::get('/admin/users/{id}', [
        UserController::class,
        'show',
    ])->middleware('permission:manage_users');

    Route::post('/admin/users', [
        UserController::class,
        'store',
    ])->middleware('permission:manage_users');

    Route::put('/admin/users/{id}', [
        UserController::class,
        'update',
    ])->middleware('permission:manage_users');

    Route::patch('/admin/users/{id}/status', [
        UserController::class,
        'updateStatus',
    ])->middleware('permission:manage_users');

    Route::delete('/admin/users/{id}', [
        UserController::class,
        'destroy',
    ])->middleware('permission:manage_users');

    /*
    |--------------------------------------------------------------------------
    | Admin System - Role Management
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/roles', [
        RoleController::class,
        'index',
    ])->middleware('permission:manage_users');

    /*
    |--------------------------------------------------------------------------
    | Admin System - Permission Management
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/permissions', [
        PermissionController::class,
        'index',
    ])->middleware('permission:manage_users');

    /*
    |--------------------------------------------------------------------------
    | Admin System - Unit Management
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/units', [
        UnitController::class,
        'index',
    ])->middleware('permission:manage_users');

    /*
    |--------------------------------------------------------------------------
    | Admin System - Document Archive
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/archive/documents', [
        ArchiveController::class,
        'index',
    ])->middleware('permission:view_all_permits');

    /*
    |--------------------------------------------------------------------------
    | Approval Targets
    |--------------------------------------------------------------------------
    */

    Route::get('/approval-targets', [
        ApprovalTargetController::class,
        'index',
    ]);

    /*
    |--------------------------------------------------------------------------
    | Permits
    |--------------------------------------------------------------------------
    */

    Route::get('/permits', [
        PermitController::class,
        'index',
    ])->middleware(
        'permission:view_all_permits,view_subordinate_permits,view_own_permits'
    );

    Route::get('/permits/{permit}', [
        PermitController::class,
        'show',
    ])->middleware(
        'permission:view_all_permits,view_subordinate_permits,view_own_permits'
    );

    Route::post('/permits', [
        PermitController::class,
        'store',
    ])->middleware('permission:create_permit');

    Route::put('/permits/{permit}', [
        PermitController::class,
        'update',
    ])->middleware('permission:edit_own_permit');

    /*
    |--------------------------------------------------------------------------
    | Approval
    |--------------------------------------------------------------------------
    */

    Route::post('/permits/{permit}/approval', [
        ApprovalController::class,
        'store',
    ]);

    /*
    |--------------------------------------------------------------------------
    | PDF
    |--------------------------------------------------------------------------
    */

    Route::post('/permits/{permit}/generate-pdf', [
        PdfController::class,
        'generate',
    ]);

    Route::get('/permits/{permit}/pdf', [
        PdfController::class,
        'download',
    ])->name('permits.pdf.download');

    /*
    |--------------------------------------------------------------------------
    | Evidence
    |--------------------------------------------------------------------------
    */

    Route::post('/permits/{permit}/evidences', [
        PermitEvidenceController::class,
        'store',
    ]);

    Route::get('/permits/{permit}/evidences/{evidence}/file', [
        PermitEvidenceController::class,
        'show',
    ])->name('permits.evidences.file');

    /*
    |--------------------------------------------------------------------------
    | Completion
    |--------------------------------------------------------------------------
    */

    Route::post('/permits/{permit}/complete', [
        PermitCompletionController::class,
        'complete',
    ]);
});

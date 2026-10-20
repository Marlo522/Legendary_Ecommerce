<?php

use App\Http\Controllers\AuthController;
use App\Http\Middleware\AuthenticateSupabase;
use Illuminate\Support\Facades\Route;

Route::get('/csrf', [AuthController::class, 'csrf'])->name('csrf');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login')->block(60, 10)->name('login');
Route::get('/me', [AuthController::class, 'me'])->middleware(AuthenticateSupabase::class)->block(60, 10)->name('me');
Route::post('/refresh', [AuthController::class, 'refresh'])->block(60, 10)->name('refresh');
Route::post('/logout', [AuthController::class, 'logout'])->block(60, 10)->name('logout');

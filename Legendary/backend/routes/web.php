<?php

use App\Http\Middleware\AuthenticateSupabase;
use App\Http\Middleware\AuthSessionSecurity;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('api/catalog')->name('catalog.')->middleware('throttle:120,1')
    ->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, PreventRequestForgery::class])
    ->group(base_path('routes/catalog.php'));

Route::prefix('api/cart')->name('cart.')->middleware([AuthSessionSecurity::class, 'throttle:120,1'])
    ->group(base_path('routes/cart.php'));

Route::prefix('api/auth')
    ->name('auth.')
    ->middleware([AuthSessionSecurity::class, 'throttle:60,1'])
    ->group(base_path('routes/auth.php'));

Route::prefix('api/account')->name('account.')
    ->middleware([AuthSessionSecurity::class, AuthenticateSupabase::class, 'throttle:60,1'])
    ->group(base_path('routes/account.php'));

Route::prefix('api/admin')->name('admin.')
    ->middleware([AuthSessionSecurity::class, AuthenticateSupabase::class, EnsureAdmin::class, 'throttle:60,1'])
    ->group(base_path('routes/admin.php'));

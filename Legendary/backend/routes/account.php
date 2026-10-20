<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AccountController::class, 'overview'])->name('overview');
Route::get('/orders', [AccountController::class, 'orders'])->name('orders');
Route::get('/orders/{order}', [AccountController::class, 'order'])->whereNumber('order')->name('order');
Route::get('/addresses', [AccountController::class, 'addresses'])->name('addresses');
Route::get('/wishlist', [AccountController::class, 'wishlist'])->name('wishlist');
Route::post('/wishlist', [WishlistController::class, 'store'])->block(60, 10)->name('wishlist.store');

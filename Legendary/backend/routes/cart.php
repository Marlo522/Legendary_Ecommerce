<?php

use App\Http\Controllers\CartController;
use Illuminate\Support\Facades\Route;

Route::get('/', [CartController::class, 'index'])->name('index');
Route::post('/items', [CartController::class, 'store'])->block(60, 10)->name('store');
Route::post('/quantity', [CartController::class, 'update'])->block(60, 10)->name('update');
Route::post('/items/{variant}/remove', [CartController::class, 'remove'])->whereNumber('variant')->block(60, 10)->name('remove');

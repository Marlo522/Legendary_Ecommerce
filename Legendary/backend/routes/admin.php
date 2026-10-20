<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AdminController::class, 'overview'])->name('overview');
Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
Route::get('/orders/{order}', [AdminController::class, 'order'])->whereNumber('order')->name('order');
Route::get('/products', [AdminController::class, 'products'])->name('products');
Route::get('/customers', [AdminController::class, 'customers'])->name('customers');

<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AdminController::class, 'overview'])->name('overview');
Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
Route::get('/orders/{order}', [AdminController::class, 'order'])->whereNumber('order')->name('order');
Route::post('/orders', [AdminManagementController::class, 'storeOrder'])->name('orders.store');
Route::put('/orders/{order}', [AdminManagementController::class, 'updateOrder'])->whereNumber('order')->name('orders.update');
Route::delete('/orders/{order}', [AdminManagementController::class, 'deleteOrder'])->whereNumber('order')->name('orders.destroy');
Route::get('/products', [AdminController::class, 'products'])->name('products');
Route::get('/categories', [AdminManagementController::class, 'categories'])->name('categories');
Route::get('/products/{product}', [AdminManagementController::class, 'product'])->whereNumber('product')->name('products.show');
Route::post('/products', [AdminManagementController::class, 'storeProduct'])->name('products.store');
Route::put('/products/{product}', [AdminManagementController::class, 'updateProduct'])->whereNumber('product')->name('products.update');
Route::delete('/products/{product}', [AdminManagementController::class, 'deleteProduct'])->whereNumber('product')->name('products.destroy');
Route::post('/products/{product}/variants', [AdminManagementController::class, 'storeVariant'])->whereNumber('product')->name('variants.store');
Route::put('/products/{product}/variants/{variant}', [AdminManagementController::class, 'updateVariant'])->whereNumber(['product', 'variant'])->name('variants.update');
Route::delete('/products/{product}/variants/{variant}', [AdminManagementController::class, 'deleteVariant'])->whereNumber(['product', 'variant'])->name('variants.destroy');
Route::post('/products/{product}/images', [AdminManagementController::class, 'storeImage'])->whereNumber('product')->name('images.store');
Route::put('/products/{product}/images/{image}', [AdminManagementController::class, 'updateImage'])->whereNumber(['product', 'image'])->name('images.update');
Route::delete('/products/{product}/images/{image}', [AdminManagementController::class, 'deleteImage'])->whereNumber(['product', 'image'])->name('images.destroy');
Route::get('/customers', [AdminController::class, 'customers'])->name('customers');

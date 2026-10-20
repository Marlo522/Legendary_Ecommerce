<?php

use App\Http\Controllers\CatalogController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [CatalogController::class, 'index'])->name('products');
Route::get('/filters', [CatalogController::class, 'filters'])->name('filters');
Route::get('/products/{slug}', [CatalogController::class, 'show'])->where('slug', '[a-zA-Z0-9_-]+')->name('product');
Route::get('/products/{slug}/reviews', [CatalogController::class, 'reviews'])->where('slug', '[a-zA-Z0-9_-]+')->name('reviews');

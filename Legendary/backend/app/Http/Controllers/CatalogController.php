<?php

namespace App\Http\Controllers;

use App\Http\Requests\CatalogRequest;
use App\Http\Requests\PaginationRequest;
use App\Repositories\CatalogRepository;
use App\Services\CatalogService;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    public function __construct(private CatalogService $catalog, private CatalogRepository $data) {}

    public function index(CatalogRequest $request): JsonResponse
    {
        return response()->json($this->catalog->listing($request->validated()));
    }

    public function filters(): JsonResponse
    {
        return response()->json(['data' => $this->catalog->filters()]);
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json(['data' => $this->catalog->detail($slug)]);
    }

    public function reviews(PaginationRequest $request, string $slug): JsonResponse
    {
        $product = $this->data->product($slug);

        return response()->json($this->data->reviews((int) $product['id'], $request->integer('page', 1)));
    }
}

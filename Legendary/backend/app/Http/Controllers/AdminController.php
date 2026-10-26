<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminListRequest;
use App\Http\Requests\PaginationRequest;
use App\Repositories\PortalRepository;
use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(private PortalService $portal, private PortalRepository $data) {}

    public function overview(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->portal->adminOverview($request->session()->get('supabase.access_token'))]);
    }

    public function orders(AdminListRequest $request): JsonResponse
    {
        return response()->json($this->data->orders(
            $request->session()->get('supabase.access_token'), null,
            $request->integer('page', 1), $request->integer('per_page', 12),
            $request->filters(),
        ));
    }

    public function order(Request $request, int $order): JsonResponse
    {
        return response()->json(['data' => $this->data->order($request->session()->get('supabase.access_token'), $order)]);
    }

    public function products(AdminListRequest $request): JsonResponse
    {
        return response()->json($this->portal->products(
            $request->session()->get('supabase.access_token'),
            $request->integer('page', 1), $request->integer('per_page', 12),
            $request->filters(),
        ));
    }

    public function customers(PaginationRequest $request): JsonResponse
    {
        return response()->json($this->data->customers(
            $request->session()->get('supabase.access_token'),
            $request->integer('page', 1), $request->integer('per_page', 12),
        ));
    }
}

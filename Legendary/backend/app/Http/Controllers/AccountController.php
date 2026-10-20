<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaginationRequest;
use App\Repositories\PortalRepository;
use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function __construct(private PortalService $portal, private PortalRepository $data) {}

    public function overview(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->portal->accountOverview(
            $request->session()->get('supabase.access_token'), $request->user()->getAuthIdentifier(),
        )]);
    }

    public function orders(PaginationRequest $request): JsonResponse
    {
        return response()->json($this->data->orders(
            $request->session()->get('supabase.access_token'), $request->user()->getAuthIdentifier(),
            $request->integer('page', 1), $request->integer('per_page', 12),
        ));
    }

    public function order(Request $request, int $order): JsonResponse
    {
        return response()->json(['data' => $this->data->order(
            $request->session()->get('supabase.access_token'), $order, $request->user()->getAuthIdentifier(),
        )]);
    }

    public function addresses(PaginationRequest $request): JsonResponse
    {
        return response()->json($this->data->addresses(
            $request->session()->get('supabase.access_token'), $request->user()->getAuthIdentifier(),
            $request->integer('page', 1), $request->integer('per_page', 12),
        ));
    }

    public function wishlist(PaginationRequest $request): JsonResponse
    {
        return response()->json($this->data->wishlist(
            $request->session()->get('supabase.access_token'), $request->user()->getAuthIdentifier(),
            $request->integer('page', 1), $request->integer('per_page', 12),
        ));
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\CartItemRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cart) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->cart->summary($request->session())]);
    }

    public function store(CartItemRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->cart->put($request->session(),
            $request->integer('variant_id'), $request->integer('quantity'), true)]);
    }

    public function update(CartItemRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->cart->put($request->session(),
            $request->integer('variant_id'), $request->integer('quantity'), false)]);
    }

    public function remove(Request $request, int $variant): JsonResponse
    {
        return response()->json(['data' => $this->cart->remove($request->session(), $variant)]);
    }
}

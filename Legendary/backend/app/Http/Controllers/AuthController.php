<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function csrf(Request $request): JsonResponse
    {
        return response()->json(['csrf_token' => $request->session()->token()]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->auth->login($request->validated(), $request->session());

        return response()->json([
            'message' => 'Logged in successfully.',
            'user' => (new UserResource($user))->resolve(),
            'csrf_token' => $request->session()->token(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => (new UserResource($request->attributes->get('supabase_user')))->resolve(),
            'csrf_token' => $request->session()->token(),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $this->auth->refresh($request->session());

        return response()->json([
            'user' => (new UserResource($user))->resolve(),
            'csrf_token' => $request->session()->token(),
        ]);
    }

    public function logout(Request $request): Response
    {
        $this->auth->logout($request->session());

        return response()->noContent();
    }
}

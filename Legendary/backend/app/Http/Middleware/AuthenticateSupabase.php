<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Auth\GenericUser;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateSupabase
{
    public function __construct(private AuthService $auth) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('supabase.access_token')) {
            return response()->json(['message' => 'Unauthenticated.', 'code' => 'session_missing'], 401);
        }

        $profile = $this->auth->currentUser($request->session());
        $request->attributes->set('supabase_user', $profile);
        $request->setUserResolver(fn () => new GenericUser($profile));

        return $next($request);
    }
}

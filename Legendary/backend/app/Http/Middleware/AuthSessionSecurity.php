<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthSessionSecurity
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');
        abort_if($origin !== null && $origin !== config('services.supabase.frontend_url'),
            403, 'This request origin is not allowed.');

        $response = $next($request);
        config(['session.expire_on_close' => ! $request->session()->get('supabase.remember', false)]);

        $response->headers->set('Cache-Control', 'no-store, private');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        return $response;
    }
}

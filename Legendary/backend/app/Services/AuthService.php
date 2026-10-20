<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Support\SupabaseClient;
use Illuminate\Contracts\Session\Session;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(private SupabaseClient $supabase, private UserRepository $users) {}

    public function login(array $credentials, Session $session): array
    {
        $response = $this->supabase->request('POST', '/auth/v1/token?grant_type=password', [
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ]);

        abort_if(in_array($response->status(), [400, 401, 403, 422], true), 401, 'The email or password is incorrect.');

        return $this->startSession($response, $session, $credentials['rememberMe'] ?? false);
    }

    public function currentUser(Session $session): array
    {
        $accessToken = $session->get('supabase.access_token');
        abort_unless(is_string($accessToken) && $accessToken !== '', 401, 'Unauthenticated.');

        $response = $this->supabase->request('GET', '/auth/v1/user', [], $accessToken);
        abort_if(in_array($response->status(), [401, 403], true), 401, 'Your session has expired. Please refresh or log in again.');
        abort_unless($response->successful(), 503, 'Authentication is temporarily unavailable.');

        $id = $response->json('id');
        abort_unless(is_string($id) && Str::isUuid($id)
            && $id === $session->get('supabase.user_id'), 401, 'Unauthenticated.');

        return $this->users->findProfile($id, $accessToken);
    }

    public function refresh(Session $session): array
    {
        $refreshToken = $session->get('supabase.refresh_token');
        abort_unless(is_string($refreshToken) && $refreshToken !== '', 401, 'Unauthenticated.');

        $response = $this->supabase->request('POST', '/auth/v1/token?grant_type=refresh_token', [
            'refresh_token' => $refreshToken,
        ]);

        if (in_array($response->status(), [400, 401, 403, 422], true)) {
            $session->invalidate();
            $session->regenerateToken();
            abort(401, 'Your session has expired. Please log in again.');
        }

        return $this->startSession($response, $session, $session->get('supabase.remember', false));
    }

    public function logout(Session $session): void
    {
        try {
            $accessToken = $session->get('supabase.access_token');

            if (is_string($accessToken) && $accessToken !== '') {
                $response = $this->supabase->request('POST', '/auth/v1/logout?scope=local', [], $accessToken);

                if (in_array($response->status(), [401, 403], true) && $session->has('supabase.refresh_token')) {
                    $refresh = $this->supabase->request('POST', '/auth/v1/token?grant_type=refresh_token', [
                        'refresh_token' => $session->get('supabase.refresh_token'),
                    ]);

                    if ($refresh->successful() && is_string($refresh->json('access_token'))) {
                        $response = $this->supabase->request('POST', '/auth/v1/logout?scope=local', [], $refresh->json('access_token'));
                    } else {
                        abort_unless(in_array($refresh->status(), [400, 401, 403, 422], true), 503, 'Session revocation is temporarily unavailable.');
                    }
                }

                abort_unless($response->successful() || in_array($response->status(), [401, 403], true),
                    503, 'Session revocation is temporarily unavailable.');
            }
        } finally {
            $session->invalidate();
            $session->regenerateToken();
        }
    }

    private function startSession(Response $response, Session $session, bool $remember): array
    {
        abort_unless($response->successful(), 503, 'Authentication is temporarily unavailable.');

        $id = $response->json('user.id');
        $accessToken = $response->json('access_token');
        $refreshToken = $response->json('refresh_token');

        abort_unless(is_string($id) && Str::isUuid($id)
            && is_string($accessToken) && $accessToken !== ''
            && is_string($refreshToken) && $refreshToken !== '',
            503, 'Authentication is temporarily unavailable.');

        $profile = $this->users->findProfile($id, $accessToken);

        $session->regenerate(true);
        $session->put('supabase', [
            'user_id' => $id,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'remember' => $remember,
        ]);

        return $profile;
    }
}

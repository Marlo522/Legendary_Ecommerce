<?php

namespace App\Repositories;

use App\Support\SupabaseClient;

class UserRepository
{
    public function __construct(private SupabaseClient $supabase) {}

    public function findProfile(string $id, string $accessToken): array
    {
        $response = $this->supabase->request('GET', '/rest/v1/users', [
            'select' => 'id,name,email,role',
            'id' => 'eq.'.$id,
            'limit' => 1,
        ], $accessToken);

        abort_unless($response->successful(), 503, 'Your profile is temporarily unavailable.');

        $profile = $response->json('0');
        abort_unless(is_array($profile) && ($profile['id'] ?? null) === $id
            && is_string($profile['name'] ?? null)
            && is_string($profile['email'] ?? null)
            && in_array($profile['role'] ?? null, ['customer', 'admin'], true),
            403, 'Your account profile is unavailable. Please contact support.');

        return $profile;
    }
}

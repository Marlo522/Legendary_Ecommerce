<?php

namespace App\Support;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use SensitiveParameter;

class SupabaseAdminClient
{
    public function ensureSeedingAllowed(): void
    {
        if (! app()->runningInConsole() || ! app()->environment(['local', 'testing'])
            || ! config('demo_seeding.enabled')) {
            throw new RuntimeException('Demo seeding requires APP_ENV=local or testing and DEMO_SEED_ENABLED=true.');
        }
    }

    public function request(string $method, string $path, #[SensitiveParameter] array $data = [], array $query = []): array
    {
        $this->ensureSeedingAllowed();
        $url = config('services.supabase.url');
        $key = config('demo_seeding.secret_key');

        if (! is_string($url) || ! filter_var($url, FILTER_VALIDATE_URL)
            || parse_url($url, PHP_URL_SCHEME) !== 'https' || ! is_string($key) || $key === '') {
            throw new RuntimeException('Configure SUPABASE_URL and a server-only SUPABASE_SECRET_KEY before seeding.');
        }

        $legacyKey = json_decode(base64_decode(strtr(explode('.', $key)[1] ?? '', '-_', '+/'), true) ?: '{}', true);
        if (! str_starts_with($key, 'sb_secret_') && ($legacyKey['role'] ?? null) !== 'service_role') {
            throw new RuntimeException('Demo seeding requires a Supabase secret or legacy service-role key.');
        }

        $client = Http::baseUrl(rtrim($url, '/'))->acceptJson()->asJson()
            ->withHeaders(['apikey' => $key, 'Prefer' => 'return=representation'])
            ->connectTimeout(3)->timeout(10)->withoutRedirecting();

        if (! str_starts_with($key, 'sb_secret_')) {
            $client = $client->withToken($key);
        }

        $options = ['query' => $query];
        if ($method !== 'GET') {
            $options['json'] = $data;
        }

        try {
            $response = $client->send($method, $path, $options);
        } catch (ConnectionException) {
            throw new RuntimeException('Supabase could not be reached. No credentials have been printed. Rerun after checking connectivity.');
        }

        if (! $response->successful() || ! is_array($response->json())) {
            throw new RuntimeException('Supabase rejected a seed request (HTTP '.$response->status().'). Check the schema, key, and Auth settings, then rerun.');
        }

        return $response->json();
    }
}

<?php

namespace App\Support;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class SupabaseClient
{
    public function request(string $method, string $path, array $data = [], ?string $accessToken = null, array $headers = []): Response
    {
        $url = config('services.supabase.url');
        $key = config('services.supabase.publishable_key');

        abort_unless(is_string($url) && filter_var($url, FILTER_VALIDATE_URL)
            && parse_url($url, PHP_URL_SCHEME) === 'https'
            && is_string($key) && $key !== '', 503, 'Authentication is temporarily unavailable.');

        // Privileged keys bypass RLS and must never be used for customer requests.
        $legacyKey = json_decode(base64_decode(strtr(explode('.', $key)[1] ?? '', '-_', '+/'), true) ?: '{}', true);
        abort_if(str_starts_with($key, 'sb_secret_')
            || (! str_starts_with($key, 'sb_publishable_') && ($legacyKey['role'] ?? null) !== 'anon'),
            503, 'Authentication is temporarily unavailable.');

        $client = Http::baseUrl(rtrim($url, '/'))
            ->acceptJson()
            ->asJson()
            ->withHeaders([...$headers, 'apikey' => $key])
            ->connectTimeout(3)
            ->timeout(10)
            ->withoutRedirecting();

        if ($accessToken !== null) {
            $client = $client->withToken($accessToken);
        }

        try {
            $response = $client->send($method, $path, [
                $method === 'GET' ? 'query' : 'json' => $data,
            ]);
        } catch (ConnectionException) {
            abort(503, 'Authentication is temporarily unavailable.');
        }

        abort_if($response->status() === 429, 429, 'Too many authentication requests. Please try again later.', ['Retry-After' => '60']);
        abort_if($response->serverError() || $response->redirect(), 503, 'Authentication is temporarily unavailable.');

        return $response;
    }
}

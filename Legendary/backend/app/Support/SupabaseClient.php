<?php

namespace App\Support;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseClient
{
    public function request(string $method, string $path, array $data = [], ?string $accessToken = null, array $headers = []): Response
    {
        try {
            $response = $this->client(Http::createPendingRequest(), $accessToken, $headers)->send($method, $path, [
                $method === 'GET' ? 'query' : 'json' => $data,
            ]);
        } catch (ConnectionException) {
            Log::warning('Supabase connection failed.', ['method' => $method, 'path' => strtok($path, '?')]);
            abort(503, 'Authentication is temporarily unavailable.');
        }

        return $this->validateResponse($response);
    }

    /** @param array<string, array{path: string, query: array}> $requests */
    public function getMany(array $requests, string $accessToken, array $headers = []): array
    {
        $responses = Http::pool(function (Pool $pool) use ($requests, $accessToken, $headers): void {
            foreach ($requests as $name => $request) {
                $this->client($pool->as($name), $accessToken, $headers)->get($request['path'], $request['query']);
            }
        });

        foreach ($responses as $name => $response) {
            abort_unless($response instanceof Response, 503, 'Account data is temporarily unavailable.');
            $responses[$name] = $this->validateResponse($response);
        }

        return $responses;
    }

    private function client(PendingRequest $client, ?string $accessToken, array $headers): PendingRequest
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

        $client = $client->baseUrl(rtrim($url, '/'))
            ->acceptJson()
            ->asJson()
            ->withHeaders([...$headers, 'apikey' => $key])
            ->connectTimeout(3)
            ->timeout(10)
            ->withoutRedirecting();

        return $accessToken === null ? $client : $client->withToken($accessToken);
    }

    private function validateResponse(Response $response): Response
    {
        abort_if($response->status() === 429, 429, 'Too many authentication requests. Please try again later.', ['Retry-After' => '60']);
        if ($response->serverError() || $response->redirect()) {
            Log::warning('Supabase upstream request failed.', ['status' => $response->status(), 'code' => $response->json('code')]);
        }
        abort_if($response->serverError() || $response->redirect(), 503, 'Authentication is temporarily unavailable.');

        return $response;
    }
}

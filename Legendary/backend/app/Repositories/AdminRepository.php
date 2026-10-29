<?php

namespace App\Repositories;

use App\Support\SupabaseClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AdminRepository
{
    public function __construct(private SupabaseClient $supabase) {}

    public function product(string $token, int $id): array
    {
        $rows = $this->query($token, 'GET', 'products', [
            'id' => 'eq.'.$id, 'select' => '*,variants:product_variants(*),images:product_images(*)', 'limit' => 1,
        ]);
        abort_if($rows === [], 404, 'Product not found.');

        return $rows[0];
    }

    public function categories(string $token): array
    {
        return $this->query($token, 'GET', 'categories', [
            'select' => 'id,name,slug', 'order' => 'display_order.asc,id.asc',
            'name' => 'in.("T-shirts","T-shirt","Cap","Caps","Tote Bag","Tote Bags")',
        ]);
    }

    public function write(string $token, string $method, string $table, array $body = [], array $filters = []): array
    {
        $result = $this->query($token, $method, $table, $filters, $body);
        if ($method !== 'POST') {
            abort_if($result === [], 409, 'This record changed or was removed. Reload it before trying again.');
        }
        $this->invalidateCatalog();

        return $result[0] ?? [];
    }

    public function orderWrite(string $token, string $function, array $body): int
    {
        $result = $this->query($token, 'POST', 'rpc/'.$function, [], $body);
        $this->invalidateCatalog();

        return (int) $result;
    }

    public function invalidateCatalog(): void
    {
        Cache::forget('catalog.products.'.sha1((string) config('services.supabase.url')));
    }

    private function query(string $token, string $method, string $path, array $filters = [], array $body = []): array|int
    {
        $response = $this->supabase->request($method, '/rest/v1/'.$path.($method !== 'GET' && $filters !== [] ? '?'.http_build_query($filters) : ''),
            $method === 'GET' ? $filters : $body, $token, ['Prefer' => 'return=representation']);
        abort_if($response->status() === 401, 401, 'Your session has expired. Please log in again.');
        $code = $response->json('code');
        abort_if($response->status() === 403 || $code === '42501', 403, 'This action is not allowed.');
        abort_if($code === 'P0002', 404, 'The requested record was not found.');
        abort_if(in_array($code, ['23503', '40001'], true), 409,
            $code === '23503' ? 'This record is used by another record. Archive the product or deactivate the variant instead.' : 'This record changed. Reload it before trying again.');
        if (in_array($code, ['23505', '23514', 'P0001', '22023', '22P02'], true)) {
            $field = $code === '23505' ? (str_contains($path, 'variants') ? 'sku' : 'slug') : 'operation';
            $message = $code === 'P0001' ? $response->json('message') : ($code === '23505' ? 'This value is already in use.' : 'The submitted values are invalid.');
            throw ValidationException::withMessages([$field => $message]);
        }
        if (! $response->successful() || (! is_array($response->json()) && ! is_int($response->json()))) {
            Log::warning('Supabase admin request failed.', [
                'method' => $method, 'path' => $path, 'status' => $response->status(),
                'code' => $code,
            ]);
        }
        abort_unless($response->successful() && (is_array($response->json()) || is_int($response->json())),
            503, 'Store operations are temporarily unavailable.');

        return $response->json();
    }
}

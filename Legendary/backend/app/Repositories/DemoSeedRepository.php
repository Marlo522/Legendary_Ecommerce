<?php

namespace App\Repositories;

use App\Support\SupabaseAdminClient;
use RuntimeException;

class DemoSeedRepository
{
    public const TABLES = [
        'users', 'addresses', 'categories', 'products', 'product_variants', 'product_images',
        'discounts', 'carts', 'cart_items', 'orders', 'order_items', 'reviews',
        'wishlist_items', 'looks', 'look_items',
    ];

    public function __construct(private SupabaseAdminClient $client) {}

    public function find(string $table, array $filters): ?array
    {
        $this->validateTable($table);
        $query = ['select' => '*', 'limit' => 1];
        foreach ($filters as $column => $value) {
            $query[$column] = 'eq.'.$value;
        }

        $rows = $this->client->request('GET', '/rest/v1/'.$table, [], $query);

        return $rows[0] ?? null;
    }

    public function required(string $table, array $filters): array
    {
        return $this->find($table, $filters)
            ?? throw new RuntimeException('Missing seed dependency in '.$table.'. Run the complete DatabaseSeeder first.');
    }

    public function save(string $table, array $filters, array $values): array
    {
        $existing = $this->find($table, $filters);
        $rows = $this->client->request(
            $existing === null ? 'POST' : 'PATCH',
            '/rest/v1/'.$table,
            [...$filters, ...$values],
            $existing === null ? [] : ['id' => 'eq.'.$existing['id']],
        );

        if (! isset($rows[0]['id'])) {
            throw new RuntimeException('Supabase did not return the saved '.$table.' seed row.');
        }

        return $rows[0];
    }

    private function validateTable(string $table): void
    {
        if (! in_array($table, self::TABLES, true)) {
            throw new RuntimeException('This table is not supported by the demo seeders.');
        }
    }
}

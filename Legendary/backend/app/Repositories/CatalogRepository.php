<?php

namespace App\Repositories;

use App\Support\SupabaseClient;
use Illuminate\Support\Facades\Cache;

class CatalogRepository
{
    private const FIELDS = 'id,name,slug,description,material,care_instructions,base_price,sale_price,is_featured,is_new_arrival,published_at,created_at,category:categories(id,name,slug,description),images:product_images(id,image_url,alt_text,display_order),variants:product_variants(id,color,color_hex,size,sku,price_override,stock_quantity,low_stock_threshold,is_active),reviews:reviews(id,rating)';

    public function __construct(private SupabaseClient $supabase) {}

    /** Public catalog snapshots avoid repeated joins for filters and derived variant-price sorting. */
    public function products(): array
    {
        return Cache::remember('catalog.products.'.sha1((string) config('services.supabase.url')), 30, function (): array {
            $products = [];
            $offset = 0;
            do {
                $batch = $this->rows('/rest/v1/products', [
                    'select' => self::FIELDS, 'status' => 'eq.active',
                    'variants.is_active' => 'eq.true', 'reviews.status' => 'eq.approved',
                    'order' => 'id.asc', 'limit' => 200, 'offset' => $offset,
                ]);
                $products = [...$products, ...$batch];
                $offset += count($batch);
            } while (count($batch) === 200);

            return $products;
        });
    }

    public function categories(): array
    {
        return Cache::remember('catalog.categories.'.sha1((string) config('services.supabase.url')), 30,
            fn (): array => $this->rows('/rest/v1/categories', [
                'select' => 'id,name,slug,description', 'order' => 'display_order.asc,id.asc',
            ]));
    }

    public function product(string $slug): array
    {
        $rows = $this->rows('/rest/v1/products', [
            'select' => self::FIELDS, 'status' => 'eq.active', 'slug' => 'eq.'.$slug,
            'variants.is_active' => 'eq.true', 'reviews.status' => 'eq.approved', 'limit' => 1,
        ]);
        abort_if($rows === [], 404, 'This product is no longer available.');

        return $rows[0];
    }

    public function variants(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        return $this->rows('/rest/v1/product_variants', [
            'select' => 'id,color,size,sku,price_override,stock_quantity,product:products!inner(id,name,slug,base_price,sale_price,images:product_images(image_url,alt_text,display_order))',
            'id' => 'in.('.implode(',', array_map('intval', $ids)).')',
            'is_active' => 'eq.true', 'product.status' => 'eq.active',
        ]);
    }

    public function reviews(int $productId, int $page): array
    {
        $response = $this->supabase->request('GET', '/rest/v1/reviews', [
            'select' => 'id,rating,comment,created_at', 'product_id' => 'eq.'.$productId,
            'status' => 'eq.approved', 'order' => 'created_at.desc,id.desc',
            'limit' => 6, 'offset' => ($page - 1) * 6,
        ], headers: ['Prefer' => 'count=exact']);
        abort_unless($response->successful() && is_array($response->json())
            && array_is_list($response->json())
            && preg_match('~/(\\d+)$~', $response->header('Content-Range') ?? '', $matches),
            503, 'The catalog is temporarily unavailable.');
        $total = (int) $matches[1];

        return ['data' => $response->json(), 'meta' => [
            'page' => $page, 'per_page' => 6, 'total' => $total,
            'last_page' => max(1, (int) ceil($total / 6)),
        ]];
    }

    private function rows(string $path, array $query): array
    {
        $response = $this->supabase->request('GET', $path, $query);
        abort_unless($response->successful() && is_array($response->json()) && array_is_list($response->json()),
            503, 'The catalog is temporarily unavailable.');

        return $response->json();
    }
}

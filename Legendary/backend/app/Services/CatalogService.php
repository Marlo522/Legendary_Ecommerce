<?php

namespace App\Services;

use App\Repositories\CatalogRepository;

class CatalogService
{
    public function __construct(private CatalogRepository $catalog) {}

    public function listing(array $filters): array
    {
        $products = array_map($this->present(...), $this->catalog->products());
        $products = array_values(array_filter($products, fn (array $product): bool => $this->matches($product, $filters)));
        $sort = $filters['sort'] ?? 'newest';
        usort($products, function (array $left, array $right) use ($sort): int {
            $comparison = match ($sort) {
                'price_asc' => $left['price'] <=> $right['price'],
                'price_desc' => $right['price'] <=> $left['price'],
                'name' => strcasecmp($left['name'], $right['name']),
                'popularity' => $right['review_count'] <=> $left['review_count'],
                default => strcmp($right['published_at'] ?? $right['created_at'], $left['published_at'] ?? $left['created_at']),
            };

            return $comparison ?: $left['id'] <=> $right['id'];
        });
        $page = (int) ($filters['page'] ?? 1);
        $perPage = (int) ($filters['per_page'] ?? 12);
        $total = count($products);

        return ['data' => array_slice($products, ($page - 1) * $perPage, $perPage), 'meta' => [
            'page' => $page, 'per_page' => $perPage, 'total' => $total,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ]];
    }

    public function filters(): array
    {
        $products = array_map($this->present(...), $this->catalog->products());
        $variants = array_merge([], ...array_column($products, 'variants'));
        $unique = static function (string $key) use ($variants): array {
            $values = array_values(array_unique(array_filter(array_column($variants, $key), fn ($value): bool => $value !== null && $value !== '')));
            sort($values, SORT_NATURAL | SORT_FLAG_CASE);

            return $values;
        };

        return [
            'categories' => array_map(function (array $category) use ($products): array {
                $matches = array_values(array_filter($products, fn (array $product): bool => ($product['category']['id'] ?? null) === $category['id']));
                $category['product_count'] = count($matches);
                $category['image'] = $matches[0]['images'][0] ?? null;

                return $category;
            }, $this->catalog->categories()),
            'colors' => $unique('color'), 'sizes' => $unique('size'),
            'max_price' => $products === [] ? 0 : max(array_column($products, 'max_price')),
        ];
    }

    public function detail(string $slug): array
    {
        $product = $this->present($this->catalog->product($slug));
        $related = array_values(array_filter(
            $this->listing(['category' => $product['category']['slug'] ?? '', 'per_page' => 50])['data'],
            fn (array $other): bool => $other['id'] !== $product['id'],
        ));
        $product['related_products'] = array_slice($related, 0, 4);

        return $product;
    }

    public function present(array $product): array
    {
        $base = $this->cents($product['base_price']);
        $sale = isset($product['sale_price']) ? $this->cents($product['sale_price']) : null;
        $price = $sale !== null && $sale < $base ? $sale : $base;
        $product['variants'] = array_values(array_filter($product['variants'] ?? [], fn (array $variant): bool => $variant['is_active'] ?? true));
        foreach ($product['variants'] as &$variant) {
            $variant['price'] = (isset($variant['price_override']) ? $this->cents($variant['price_override']) : $price) / 100;
            $variant['stock_quantity'] = max(0, (int) $variant['stock_quantity']);
            $variant['in_stock'] = $variant['stock_quantity'] > 0;
        }
        unset($variant);
        $prices = array_column($product['variants'], 'price');
        $product['price'] = $prices === [] ? $price / 100 : min($prices);
        $product['max_price'] = $prices === [] ? $price / 100 : max($prices);
        $product['original_price'] = $sale !== null && $sale < $base && $product['price'] === $sale / 100 ? $base / 100 : null;
        $stock = array_column($product['variants'], 'stock_quantity');
        $product['in_stock'] = array_sum($stock) > 0;
        $product['low_stock'] = $product['in_stock'] && count(array_filter($product['variants'],
            fn (array $variant): bool => $variant['stock_quantity'] > 0 && $variant['stock_quantity'] <= $variant['low_stock_threshold'])) > 0;
        usort($product['images'], fn (array $left, array $right): int => ($left['display_order'] <=> $right['display_order']) ?: (($left['id'] ?? 0) <=> ($right['id'] ?? 0)));
        $ratings = array_column($product['reviews'] ?? [], 'rating');
        $product['review_count'] = count($ratings);
        $product['average_rating'] = $ratings === [] ? null : round(array_sum($ratings) / count($ratings), 1);
        unset($product['reviews']);

        return $product;
    }

    public function cents(string|int|float $amount): int
    {
        return (int) round((float) $amount * 100);
    }

    private function matches(array $product, array $filters): bool
    {
        if (! empty($filters['q']) && ! str_contains(
            mb_strtolower(implode(' ', [$product['name'], $product['description'] ?? '', $product['category']['name'] ?? ''])),
            mb_strtolower($filters['q']),
        )) {
            return false;
        }
        if (! empty($filters['category']) && ($product['category']['slug'] ?? '') !== $filters['category']) {
            return false;
        }
        if (($filters['collection'] ?? '') === 'featured' && ! $product['is_featured']) {
            return false;
        }
        if (($filters['collection'] ?? '') === 'new-arrivals' && ! $product['is_new_arrival']) {
            return false;
        }
        $availability = $filters['availability'] ?? '';
        $hasVariantFilter = ! empty($filters['color']) || ! empty($filters['size']) || isset($filters['min_price']) || isset($filters['max_price']);
        $variants = $product['variants'];
        if ($variants === []) {
            return ! $hasVariantFilter && $availability !== 'in-stock';
        }
        $matching = array_filter($variants, function (array $variant) use ($filters): bool {
            return (empty($filters['color']) || strcasecmp($variant['color'], $filters['color']) === 0)
                && (empty($filters['size']) || $variant['size'] === $filters['size'])
                && (! isset($filters['min_price']) || $variant['price'] >= (float) $filters['min_price'])
                && (! isset($filters['max_price']) || $variant['price'] <= (float) $filters['max_price']);
        });
        if ($availability === 'in-stock') {
            return count(array_filter($matching, fn (array $variant): bool => $variant['in_stock'])) > 0;
        }
        if ($availability === 'out-of-stock') {
            return count($matching) > 0 && count(array_filter($matching, fn (array $variant): bool => $variant['in_stock'])) === 0;
        }

        return count($matching) > 0;
    }
}

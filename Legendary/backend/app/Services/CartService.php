<?php

namespace App\Services;

use App\Repositories\CatalogRepository;
use Illuminate\Contracts\Session\Session;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function __construct(private CatalogRepository $catalog, private CatalogService $pricing) {}

    public function summary(Session $session): array
    {
        $quantities = $session->get('storefront_cart', []);
        $variants = $this->catalog->variants(array_keys($quantities));
        $items = [];
        $subtotal = 0;
        foreach ($variants as $variant) {
            $product = $variant['product'];
            $base = $this->pricing->cents($product['base_price']);
            $sale = isset($product['sale_price']) ? $this->pricing->cents($product['sale_price']) : $base;
            $unit = isset($variant['price_override']) ? $this->pricing->cents($variant['price_override']) : min($sale, $base);
            $quantity = (int) $quantities[$variant['id']];
            $stock = max(0, (int) $variant['stock_quantity']);
            $subtotal += $unit * $quantity;
            usort($product['images'], fn (array $left, array $right): int => $left['display_order'] <=> $right['display_order']);
            $items[] = [
                'variant_id' => $variant['id'], 'name' => $product['name'], 'slug' => $product['slug'],
                'color' => $variant['color'], 'size' => $variant['size'], 'image' => $product['images'][0] ?? null,
                'quantity' => $quantity, 'unit_price' => $unit / 100, 'line_total' => $unit * $quantity / 100,
                'stock_quantity' => $stock, 'available' => $quantity <= $stock,
            ];
        }
        $unavailable = count($quantities) - count($items);

        return ['items' => $items, 'count' => array_sum(array_column($items, 'quantity')),
            'subtotal' => $subtotal / 100, 'unavailable_items' => $unavailable];
    }

    public function put(Session $session, int $variantId, int $quantity, bool $add): array
    {
        $quantities = $session->get('storefront_cart', []);
        $variant = $this->catalog->variants([$variantId])[0] ?? null;
        $quantity += $add ? (int) ($quantities[$variantId] ?? 0) : 0;
        if ($variant === null || $quantity > 99 || $quantity > max(0, (int) $variant['stock_quantity'])) {
            throw ValidationException::withMessages(['quantity' => 'The selected quantity is not available. Please choose an in-stock option.']);
        }
        if (! isset($quantities[$variantId]) && count($quantities) >= 50) {
            throw ValidationException::withMessages(['variant_id' => 'Your bag has reached its item limit. Remove an item before adding another.']);
        }
        $quantities[$variantId] = $quantity;
        $session->put('storefront_cart', $quantities);

        return $this->summary($session);
    }

    public function remove(Session $session, int $variantId): array
    {
        $quantities = $session->get('storefront_cart', []);
        unset($quantities[$variantId]);
        $session->put('storefront_cart', $quantities);

        return $this->summary($session);
    }
}

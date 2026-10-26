<?php

namespace App\Services;

use App\Repositories\PortalRepository;

class PortalService
{
    public function __construct(private PortalRepository $data) {}

    public function accountOverview(string $token, string $userId): array
    {
        $summary = $this->data->accountSummary($token, $userId);
        $orders = $summary['orders'];
        $wishlist = $summary['wishlist'];
        $addresses = $summary['addresses'];

        return [
            'stats' => [
                'orders' => $orders['meta']['total'],
                'saved_items' => $wishlist['meta']['total'],
                'addresses' => $addresses['meta']['total'],
            ],
            'recent_orders' => $orders['data'],
            'delivery_address' => $addresses['data'][0] ?? null,
        ];
    }

    public function adminOverview(string $token): array
    {
        $orders = $this->data->orders($token, null, 1, 5);

        return [
            'stats' => [
                'orders' => $orders['meta']['total'],
                'awaiting_fulfillment' => $this->data->awaitingFulfillmentCount($token),
                'active_products' => $this->data->activeProductCount($token),
                'customers' => $this->data->customers($token, 1, 1)['meta']['total'],
            ],
            'recent_orders' => $orders['data'],
        ];
    }

    public function products(string $token, int $page, int $perPage, array $filters = []): array
    {
        $result = $this->data->products($token, $page, $perPage, $filters);
        $result['data'] = array_map(function (array $product): array {
            $activeVariants = array_filter($product['variants'] ?? [], fn (array $variant): bool => (bool) $variant['is_active']);
            $product['stock_quantity'] = array_sum(array_column($activeVariants, 'stock_quantity'));
            $product['has_low_stock'] = count(array_filter($activeVariants,
                fn (array $variant): bool => $variant['stock_quantity'] <= $variant['low_stock_threshold'])) > 0;
            unset($product['variants']);

            return $product;
        }, $result['data']);

        return $result;
    }
}

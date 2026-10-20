<?php

namespace App\Repositories;

use App\Support\SupabaseClient;

class PortalRepository
{
    private const ORDER_FIELDS = 'id,order_number,status,subtotal,shipping_fee,discount_amount,total,created_at';

    public function __construct(private SupabaseClient $supabase) {}

    public function orders(string $token, ?string $userId = null, int $page = 1, int $perPage = 12): array
    {
        $select = self::ORDER_FIELDS;
        $filters = [];
        if ($userId !== null) {
            $filters['user_id'] = 'eq.'.$userId;
        } else {
            $select .= ',guest_name,guest_email,customer:users(name,email)';
        }

        return $this->paginate('orders', $select, $token, $filters, $page, $perPage);
    }

    public function order(string $token, int $id, ?string $userId = null): array
    {
        $filters = ['id' => 'eq.'.$id];
        if ($userId !== null) {
            $filters['user_id'] = 'eq.'.$userId;
        }
        $select = self::ORDER_FIELDS.',shipping_address,payment_method,payment_status,items:order_items(id,product_name,variant_label,quantity,unit_price,line_total)';
        if ($userId === null) {
            $select .= ',guest_name,guest_email,guest_phone,customer:users(name,email)';
        }
        $result = $this->paginate('orders', $select, $token, $filters, 1, 1);
        abort_if($result['data'] === [], 404, 'Order not found.');

        return $result['data'][0];
    }

    public function addresses(string $token, string $userId, int $page = 1, int $perPage = 12): array
    {
        return $this->paginate('addresses',
            'id,label,recipient_name,phone,address_line_1,address_line_2,city,province,postal_code,country,is_default',
            $token, ['user_id' => 'eq.'.$userId], $page, $perPage, 'is_default.desc,created_at.desc,id.desc');
    }

    public function wishlist(string $token, string $userId, int $page = 1, int $perPage = 12): array
    {
        return $this->paginate('wishlist_items',
            'id,created_at,product:products(id,name,slug,base_price,sale_price,product_images(image_url,alt_text,display_order))',
            $token, ['user_id' => 'eq.'.$userId], $page, $perPage);
    }

    public function products(string $token, int $page = 1, int $perPage = 12): array
    {
        return $this->paginate('products',
            'id,name,slug,base_price,sale_price,status,created_at,category:categories(name),variants:product_variants(stock_quantity,low_stock_threshold,is_active)',
            $token, [], $page, $perPage);
    }

    public function customers(string $token, int $page = 1, int $perPage = 12): array
    {
        return $this->paginate('users', 'id,name,email,created_at', $token, ['role' => 'eq.customer'], $page, $perPage);
    }

    public function awaitingFulfillmentCount(string $token): int
    {
        return $this->paginate('orders', 'id', $token, ['status' => 'in.(pending,confirmed,packed)'], 1, 1)['meta']['total'];
    }

    public function activeProductCount(string $token): int
    {
        return $this->paginate('products', 'id', $token, ['status' => 'eq.active'], 1, 1)['meta']['total'];
    }

    /** @return array{data: array, meta: array{page: int, per_page: int, total: int, last_page: int}} */
    private function paginate(string $table, string $select, string $token, array $filters, int $page, int $perPage, string $order = 'created_at.desc,id.desc'): array
    {
        $response = $this->supabase->request('GET', '/rest/v1/'.$table, [
            ...$filters,
            'select' => $select,
            'order' => $order,
            'limit' => $perPage,
            'offset' => ($page - 1) * $perPage,
        ], $token, ['Prefer' => 'count=exact']);

        abort_if($response->status() === 401, 401, 'Your session has expired. Please log in again.');
        abort_unless($response->successful() && is_array($response->json())
            && array_is_list($response->json())
            && preg_match('~/(\d+)$~', $response->header('Content-Range') ?? '', $matches),
            503, 'Account data is temporarily unavailable.');

        $total = (int) $matches[1];

        return [
            'data' => $response->json(),
            'meta' => [
                'page' => $page, 'per_page' => $perPage, 'total' => $total,
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ];
    }
}

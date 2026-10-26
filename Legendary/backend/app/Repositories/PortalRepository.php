<?php

namespace App\Repositories;

use App\Support\SupabaseClient;
use Illuminate\Http\Client\Response;

class PortalRepository
{
    private const ORDER_FIELDS = 'id,order_number,status,subtotal,shipping_fee,discount_amount,total,created_at';

    public function __construct(private SupabaseClient $supabase) {}

    public function accountSummary(string $token, string $userId): array
    {
        $filter = ['user_id' => 'eq.'.$userId];
        $requests = [
            'orders' => ['path' => '/rest/v1/orders', 'query' => ['deleted_at' => 'is.null',
                ...$filter, 'select' => self::ORDER_FIELDS, 'order' => 'created_at.desc,id.desc', 'limit' => 5,
            ]],
            'wishlist' => ['path' => '/rest/v1/wishlist_items', 'query' => [
                ...$filter, 'select' => 'id', 'limit' => 1,
            ]],
            'addresses' => ['path' => '/rest/v1/addresses', 'query' => [
                ...$filter,
                'select' => 'id,label,recipient_name,phone,address_line_1,address_line_2,city,province,postal_code,country,is_default',
                'order' => 'is_default.desc,created_at.desc,id.desc', 'limit' => 1,
            ]],
        ];
        $responses = $this->supabase->getMany($requests, $token, ['Prefer' => 'count=exact']);
        $responses['orders'] = $this->retryLegacyOrders($responses['orders'], $requests['orders']['query'], $token);

        return [
            'orders' => $this->pageResponse($responses['orders'], 1, 5),
            'wishlist' => $this->pageResponse($responses['wishlist'], 1, 1),
            'addresses' => $this->pageResponse($responses['addresses'], 1, 1),
        ];
    }

    public function orders(string $token, ?string $userId = null, int $page = 1, int $perPage = 12, array $adminFilters = []): array
    {
        $select = self::ORDER_FIELDS;
        $filters = [...$adminFilters, 'deleted_at' => 'is.null'];
        if ($userId !== null) {
            $filters['user_id'] = 'eq.'.$userId;
        } else {
            $select .= ',guest_name,guest_email,customer:users(name,email)';
        }

        return $this->paginate('orders', $select, $token, $filters, $page, $perPage);
    }

    public function order(string $token, int $id, ?string $userId = null): array
    {
        $filters = ['id' => 'eq.'.$id, 'deleted_at' => 'is.null'];
        if ($userId !== null) {
            $filters['user_id'] = 'eq.'.$userId;
        }
        $select = self::ORDER_FIELDS.',shipping_address,payment_method,payment_status,items:order_items(id,product_variant_id,product_name,variant_label,quantity,unit_price,line_total)';
        if ($userId === null) {
            $select .= ',updated_at,notes,guest_name,guest_email,guest_phone,customer:users(name,email)';
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

    public function products(string $token, int $page = 1, int $perPage = 12, array $filters = []): array
    {
        return $this->paginate('products',
            'id,name,slug,base_price,sale_price,status,created_at,category:categories(name),variants:product_variants(stock_quantity,low_stock_threshold,is_active)',
            $token, $filters, $page, $perPage);
    }

    public function customers(string $token, int $page = 1, int $perPage = 12): array
    {
        return $this->paginate('users', 'id,name,email,created_at', $token, ['role' => 'eq.customer'], $page, $perPage);
    }

    public function awaitingFulfillmentCount(string $token): int
    {
        return $this->paginate('orders', 'id', $token, ['deleted_at' => 'is.null', 'status' => 'in.(pending,confirmed,packed)'], 1, 1)['meta']['total'];
    }

    public function activeProductCount(string $token): int
    {
        return $this->paginate('products', 'id', $token, ['status' => 'eq.active'], 1, 1)['meta']['total'];
    }

    /** @return array{data: array, meta: array{page: int, per_page: int, total: int, last_page: int}} */
    private function paginate(string $table, string $select, string $token, array $filters, int $page, int $perPage, string $order = 'created_at.desc,id.desc'): array
    {
        $query = [
            ...$filters,
            'select' => $select,
            'order' => $order,
            'limit' => $perPage,
            'offset' => ($page - 1) * $perPage,
        ];
        $response = $this->supabase->request('GET', '/rest/v1/'.$table, $query, $token, ['Prefer' => 'count=exact']);
        if ($table === 'orders') {
            $response = $this->retryLegacyOrders($response, $query, $token);
        }

        if ($table === 'products' && $response->status() === 416 && $response->json('code') === 'PGRST103'
            && preg_match('~^\*/(\d+)$~', $response->header('Content-Range') ?? '', $matches)) {
            $lastPage = max(1, (int) ceil((int) $matches[1] / $perPage));
            if ($page > $lastPage) {
                return $this->paginate($table, $select, $token, $filters, $lastPage, $perPage, $order);
            }
        }

        return $this->pageResponse($response, $page, $perPage);
    }

    /** Older databases cannot contain soft-deleted orders until admin_management.sql adds the column. */
    private function retryLegacyOrders(Response $response, array $query, string $token): Response
    {
        if ($response->status() !== 400 || $response->json('code') !== '42703'
            || $response->json('message') !== 'column orders.deleted_at does not exist') {
            return $response;
        }

        unset($query['deleted_at']);

        return $this->supabase->request('GET', '/rest/v1/orders', $query, $token, ['Prefer' => 'count=exact']);
    }

    private function pageResponse(Response $response, int $page, int $perPage): array
    {
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

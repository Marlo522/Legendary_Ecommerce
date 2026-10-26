<?php

namespace App\Services;

use App\Repositories\AdminRepository;
use Illuminate\Validation\ValidationException;

class AdminService
{
    public function __construct(private AdminRepository $data) {}

    public function saveProduct(string $token, array $values, ?int $id = null): array
    {
        $categoryIds = array_column($this->data->categories($token), 'id');
        if (! in_array($values['category_id'], $categoryIds)) {
            throw ValidationException::withMessages(['category_id' => 'Choose T-shirts, Caps, or Tote Bags.']);
        }
        $filters = [];
        if ($id !== null) {
            $product = $this->data->product($token, $id);
            $filters = ['id' => 'eq.'.$id, 'updated_at' => 'eq.'.$values['updated_at']];
        }
        unset($values['updated_at']);
        $values['published_at'] = $values['status'] === 'active' ? ($product['published_at'] ?? now()->toIso8601String()) : null;
        $values['updated_at'] = now()->toISOString();

        return $this->data->write($token, $id === null ? 'POST' : 'PATCH', 'products', $values, $filters);
    }

    public function saveVariant(string $token, int $productId, array $values, ?int $id = null): array
    {
        $product = $this->data->product($token, $productId);
        $filters = [];
        if ($id !== null) {
            abort_unless(in_array($id, array_column($product['variants'], 'id')), 404, 'Variant not found.');
            $filters = ['id' => 'eq.'.$id, 'product_id' => 'eq.'.$productId, 'updated_at' => 'eq.'.$values['updated_at']];
        }
        unset($values['updated_at']);

        return $this->data->write($token, $id === null ? 'POST' : 'PATCH', 'product_variants',
            [...$values, 'product_id' => $productId, 'updated_at' => now()->toISOString()], $filters);
    }

    public function deleteChild(string $token, int $productId, string $table, int $id, string $updatedAt): void
    {
        $product = $this->data->product($token, $productId);
        $relation = $table === 'product_images' ? 'images' : 'variants';
        abort_unless(in_array($id, array_column($product[$relation], 'id')), 404, 'Record not found.');
        $this->data->write($token, 'DELETE', $table, [], [
            'id' => 'eq.'.$id, 'product_id' => 'eq.'.$productId, 'updated_at' => 'eq.'.$updatedAt,
        ]);
    }
}

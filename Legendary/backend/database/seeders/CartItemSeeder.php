<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class CartItemSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $cart = $this->data->required('carts', ['user_id' => $this->customerId(), 'session_id' => 'legendary-demo-cart']);
        foreach (array_slice($this->orderLines(), 0, 2) as $line) {
            $this->data->save('cart_items', [
                'cart_id' => $cart['id'], 'product_variant_id' => $line['product_variant_id'],
            ], ['quantity' => $line['quantity'], 'unit_price' => $line['unit_price']]);
        }
    }
}

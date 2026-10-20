<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class WishlistItemSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $this->data->save('wishlist_items', [
            'user_id' => $this->customerId(),
            'product_id' => $this->data->required('products', ['slug' => 'demo-tote'])['id'],
        ], []);
    }
}

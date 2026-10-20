<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class ProductImageSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        foreach (['tshirt' => 'category-tshirts.jpg', 'cap' => 'category-caps.jpg', 'tote' => 'category-totebags.jpg'] as $slug => $image) {
            $this->data->save('product_images', [
                'product_id' => $this->data->required('products', ['slug' => 'demo-'.$slug])['id'],
                'display_order' => 0,
            ], [
                'image_url' => config('demo_seeding.asset_url').'/'.$image,
                'alt_text' => 'Demo '.$slug.' category photo',
            ]);
        }
    }
}

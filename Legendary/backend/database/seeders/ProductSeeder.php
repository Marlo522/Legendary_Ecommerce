<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class ProductSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        foreach ([
            ['tshirts', 'tshirt', 'Demo Everyday T-shirt', '750.00', 'Cotton'],
            ['caps', 'cap', 'Demo Everyday Cap', '450.00', 'Cotton twill'],
            ['tote-bags', 'tote', 'Demo Everyday Tote Bag', '350.00', 'Cotton canvas'],
        ] as [$category, $slug, $name, $price, $material]) {
            $this->data->save('products', ['slug' => 'demo-'.$slug], [
                'category_id' => $this->data->required('categories', ['slug' => 'demo-'.$category])['id'],
                'name' => $name, 'description' => 'Development sample; not a production product.',
                'material' => $material, 'base_price' => $price, 'status' => 'active',
                'is_featured' => true, 'is_new_arrival' => true, 'published_at' => now()->toIso8601String(),
            ]);
        }
    }
}

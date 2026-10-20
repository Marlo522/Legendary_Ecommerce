<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class CategorySeeder extends DemoSeeder
{
    protected function seed(): void
    {
        foreach (['tshirts' => 'T-shirts', 'caps' => 'Caps', 'tote-bags' => 'Tote Bags'] as $slug => $name) {
            $this->data->save('categories', ['slug' => 'demo-'.$slug], [
                'name' => $name, 'description' => 'Development sample category.',
            ]);
        }
    }
}

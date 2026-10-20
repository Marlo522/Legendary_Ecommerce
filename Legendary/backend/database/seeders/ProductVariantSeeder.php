<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class ProductVariantSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        foreach ([
            ['demo-tshirt', 'DEMO-TEE-BLK-S', 'Black', '#0A0A0A', 'S'],
            ['demo-tshirt', 'DEMO-TEE-BLK-M', 'Black', '#0A0A0A', 'M'],
            ['demo-tshirt', 'DEMO-TEE-BLK-L', 'Black', '#0A0A0A', 'L'],
            ['demo-cap', 'DEMO-CAP-BLK', 'Black', '#0A0A0A', 'One size'],
            ['demo-tote', 'DEMO-TOTE-NAT', 'Natural', '#F4F4F0', 'One size'],
        ] as [$slug, $sku, $color, $hex, $size]) {
            $this->data->save('product_variants', ['sku' => $sku], [
                'product_id' => $this->data->required('products', ['slug' => $slug])['id'],
                'color' => $color, 'color_hex' => $hex, 'size' => $size,
                'stock_quantity' => 25, 'low_stock_threshold' => 5, 'is_active' => true,
            ]);
        }
    }
}

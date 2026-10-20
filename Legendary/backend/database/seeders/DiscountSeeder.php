<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class DiscountSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $this->data->save('discounts', ['code' => 'DEMO10'], [
            'type' => 'percentage', 'value' => '10.00', 'min_order_value' => '500.00',
            'max_discount_amount' => '200.00', 'usage_limit' => 100, 'usage_count' => 1,
            'is_active' => true, 'starts_at' => now()->subDay()->toIso8601String(),
            'expires_at' => now()->addDays(30)->toIso8601String(),
        ]);
    }
}

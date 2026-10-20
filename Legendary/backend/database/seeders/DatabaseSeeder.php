<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class DatabaseSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $this->call([
            UserSeeder::class,
            AddressSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            ProductVariantSeeder::class,
            ProductImageSeeder::class,
            DiscountSeeder::class,
            CartSeeder::class,
            CartItemSeeder::class,
            OrderSeeder::class,
            OrderItemSeeder::class,
            ReviewSeeder::class,
            WishlistItemSeeder::class,
            LookSeeder::class,
            LookItemSeeder::class,
        ]);
    }
}

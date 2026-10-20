<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class CartSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $this->data->save('carts', [
            'user_id' => $this->customerId(), 'session_id' => 'legendary-demo-cart',
        ], []);
    }
}

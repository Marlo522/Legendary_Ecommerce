<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class ReviewSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $this->data->save('reviews', [
            'product_id' => $this->data->required('products', ['slug' => 'demo-tshirt'])['id'],
            'user_id' => $this->customerId(),
            'order_id' => $this->data->required('orders', ['order_number' => 'DEMO-ORDER-0001'])['id'],
        ], ['rating' => 4, 'comment' => 'Demo review for development only.', 'status' => 'approved']);
    }
}

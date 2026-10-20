<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class OrderItemSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $order = $this->data->required('orders', ['order_number' => 'DEMO-ORDER-0001']);
        foreach ($this->orderLines() as $line) {
            $this->data->save('order_items', [
                'order_id' => $order['id'], 'product_variant_id' => $line['product_variant_id'],
            ], [
                'product_name' => $line['product_name'], 'variant_label' => $line['variant_label'],
                'quantity' => $line['quantity'], 'unit_price' => $line['unit_price'],
                'line_total' => $this->money($line['cents'] * $line['quantity']),
            ]);
        }
    }
}

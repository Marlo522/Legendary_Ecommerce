<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class OrderSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $subtotal = array_sum(array_column($this->orderLines(), 'cents'));
        $discount = $this->data->required('discounts', ['code' => 'DEMO10']);
        $discountCents = min(intdiv($subtotal * (int) $discount['value'], 100), (int) round((float) $discount['max_discount_amount'] * 100));
        $address = $this->data->required('addresses', ['user_id' => $this->customerId(), 'label' => 'Demo address']);
        $shippingAddress = array_intersect_key($address, array_flip([
            'recipient_name', 'phone', 'address_line_1', 'city', 'province', 'postal_code', 'country',
        ]));
        $this->data->save('orders', ['order_number' => 'DEMO-ORDER-0001'], [
            'user_id' => $this->customerId(), 'status' => 'completed',
            'subtotal' => $this->money($subtotal), 'shipping_fee' => '100.00',
            'discount_id' => $discount['id'], 'discount_amount' => $this->money($discountCents),
            'total' => $this->money($subtotal - $discountCents + 10000),
            'shipping_address' => $shippingAddress, 'payment_method' => 'mock',
            'payment_status' => 'paid', 'notes' => 'Development sample only; no real payment was made.',
        ]);
    }
}

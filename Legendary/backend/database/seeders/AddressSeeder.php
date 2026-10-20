<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class AddressSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $this->data->save('addresses', ['user_id' => $this->customerId(), 'label' => 'Demo address'], [
            'recipient_name' => 'Demo Customer', 'phone' => '09000000000',
            'address_line_1' => '100 Demo Street', 'city' => 'Demo City', 'province' => 'Demo Province',
            'postal_code' => '1000', 'country' => 'PH', 'is_default' => true,
        ]);
    }
}

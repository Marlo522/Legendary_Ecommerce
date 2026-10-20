<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class LookItemSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $look = $this->data->required('looks', ['user_id' => $this->customerId(), 'name' => 'Demo neutral outfit']);
        foreach (array_combine(['tshirt', 'cap', 'tote_bag'], self::LOOK_SKUS) as $slot => $sku) {
            $this->data->save('look_items', ['look_id' => $look['id'], 'category_slot' => $slot], [
                'product_variant_id' => $this->data->required('product_variants', ['sku' => $sku])['id'],
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use Database\Seeders\Support\DemoSeeder;

class LookSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $this->data->save('looks', ['user_id' => $this->customerId(), 'name' => 'Demo neutral outfit'], [
            'color_match_label' => 'Neutral match',
        ]);
    }
}

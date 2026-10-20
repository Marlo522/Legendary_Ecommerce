<?php

namespace Database\Seeders\Support;

use App\Repositories\DemoSeedRepository;
use App\Support\SupabaseAdminClient;
use Illuminate\Database\Seeder;

abstract class DemoSeeder extends Seeder
{
    protected DemoSeedRepository $data;

    protected const LOOK_SKUS = ['DEMO-TEE-BLK-M', 'DEMO-CAP-BLK', 'DEMO-TOTE-NAT'];

    final public function run(DemoSeedRepository $data, SupabaseAdminClient $client): void
    {
        $client->ensureSeedingAllowed();
        $this->data = $data;
        $this->seed();
    }

    abstract protected function seed(): void;

    protected function customerId(): string
    {
        return $this->data->required('users', [
            'email' => strtolower(config('demo_seeding.users.customer.email')),
        ])['id'];
    }

    /** @return list<array{product_variant_id: int, product_name: string, variant_label: string, quantity: int, unit_price: string, cents: int}> */
    protected function orderLines(): array
    {
        $lines = [];
        foreach (self::LOOK_SKUS as $sku) {
            $variant = $this->data->required('product_variants', ['sku' => $sku]);
            $product = $this->data->required('products', ['id' => $variant['product_id']]);
            $price = $variant['price_override'] ?? $product['sale_price'] ?? $product['base_price'];
            $lines[] = [
                'product_variant_id' => $variant['id'],
                'product_name' => $product['name'],
                'variant_label' => $variant['color'].' / '.$variant['size'],
                'quantity' => 1,
                'unit_price' => number_format((float) $price, 2, '.', ''),
                'cents' => (int) round((float) $price * 100),
            ];
        }

        return $lines;
    }

    protected function money(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }
}

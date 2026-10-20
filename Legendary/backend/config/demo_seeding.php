<?php

return [
    'enabled' => env('DEMO_SEED_ENABLED', false),
    'secret_key' => env('SUPABASE_SECRET_KEY', env('SUPABASE_SERVICE_ROLE_KEY')),
    'asset_url' => rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/').'/src/assets',
    'users' => [
        'admin' => [
            'name' => 'Demo Administrator',
            'email' => env('DEMO_ADMIN_EMAIL', 'admin@legendary.test'),
            'password' => env('DEMO_ADMIN_PASSWORD'),
        ],
        'customer' => [
            'name' => 'Demo Customer',
            'email' => env('DEMO_CUSTOMER_EMAIL', 'customer@legendary.test'),
            'password' => env('DEMO_CUSTOMER_PASSWORD'),
        ],
    ],
];

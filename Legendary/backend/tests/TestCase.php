<?php

namespace Tests;

abstract class TestCase extends \Illuminate\Foundation\Testing\TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config([
            'app.key' => 'base64:'.base64_encode(str_repeat('t', 32)),
            'session.driver' => 'array', 'cache.default' => 'array',
            'services.product_images.driver' => 'local',
            'services.supabase.url' => 'https://supabase.test',
            'services.supabase.publishable_key' => 'sb_publishable_test',
        ]);
    }
}

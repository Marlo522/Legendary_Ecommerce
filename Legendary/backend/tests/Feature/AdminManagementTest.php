<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    private const USER_ID = 'a0000000-0000-4000-8000-000000000001';

    public static function protectedEndpoints(): array
    {
        return [
            'product read' => ['GET', '/api/admin/products/1'],
            'product create' => ['POST', '/api/admin/products'],
            'product update' => ['PUT', '/api/admin/products/1'],
            'product delete' => ['DELETE', '/api/admin/products/1'],
            'variant create' => ['POST', '/api/admin/products/1/variants'],
            'variant update' => ['PUT', '/api/admin/products/1/variants/2'],
            'variant delete' => ['DELETE', '/api/admin/products/1/variants/2'],
            'image upload' => ['POST', '/api/admin/products/1/images'],
            'image update' => ['PUT', '/api/admin/products/1/images/2'],
            'image delete' => ['DELETE', '/api/admin/products/1/images/2'],
            'order create' => ['POST', '/api/admin/orders'],
            'order update' => ['PUT', '/api/admin/orders/1'],
            'order delete' => ['DELETE', '/api/admin/orders/1'],
        ];
    }

    #[DataProvider('protectedEndpoints')]
    public function test_returns_401_without_a_session(string $method, string $path): void
    {
        Http::preventStrayRequests();

        $this->json($method, $path)->assertUnauthorized()->assertJsonPath('code', 'session_missing');

        Http::assertNothingSent();
    }

    #[DataProvider('protectedEndpoints')]
    public function test_returns_403_for_a_customer(string $method, string $path): void
    {
        $this->authenticate('customer');

        $this->json($method, $path)->assertForbidden();

        Http::assertSentCount(2);
    }

    public function test_creates_a_product_and_ignores_untrusted_extra_fields(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/categories*' => Http::response([['id' => 1, 'name' => 'T-shirts']]),
            'https://supabase.test/rest/v1/products' => Http::response([['id' => 5, ...$this->productPayload()]], 201),
        ]);

        $this->postJson('/api/admin/products', [...$this->productPayload(), 'id' => 999, 'role' => 'admin'])
            ->assertCreated()->assertJsonPath('data.id', 5);

        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
            && $request->url() === 'https://supabase.test/rest/v1/products'
            && $request['base_price'] === '500.00' && ! isset($request['id'], $request['role'])
            && $request->hasHeader('Authorization', 'Bearer admin-session'));
    }

    public function test_returns_422_for_invalid_product_prices_and_slug(): void
    {
        $this->authenticate();

        $this->postJson('/api/admin/products', [...$this->productPayload(), 'slug' => 'Invalid slug', 'sale_price' => 600])
            ->assertUnprocessable()->assertJsonValidationErrors(['slug', 'sale_price']);

        Http::assertSentCount(2);
    }

    public function test_returns_422_for_an_unsupported_category(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/categories*' => Http::response([['id' => 1, 'name' => 'T-shirts']])]);

        $this->postJson('/api/admin/products', [...$this->productPayload(), 'category_id' => 99])
            ->assertUnprocessable()->assertJsonValidationErrors(['category_id']);

        Http::assertNotSent(fn (Request $request): bool => $request->method() === 'POST');
    }

    public function test_returns_404_for_a_missing_product(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/products*' => Http::response([])]);

        $this->getJson('/api/admin/products/99')->assertNotFound();
    }

    public function test_returns_422_for_negative_inventory(): void
    {
        $this->authenticate();

        $this->postJson('/api/admin/products/1/variants', [...$this->variantPayload(), 'stock_quantity' => -1])
            ->assertUnprocessable()->assertJsonValidationErrors(['stock_quantity']);

        Http::assertSentCount(2);
    }

    public function test_updates_inventory_with_a_concurrency_filter(): void
    {
        $this->authenticate();
        $variant = ['id' => 2, ...$this->variantPayload(), 'updated_at' => '2026-10-23T01:00:00Z'];
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1, 'variants' => [$variant], 'images' => []]]),
            'https://supabase.test/rest/v1/product_variants*' => Http::response([['id' => 2, ...$this->variantPayload()]]),
        ]);

        $this->putJson('/api/admin/products/1/variants/2', $variant)->assertOk()->assertJsonPath('data.stock_quantity', 10);

        Http::assertSent(fn (Request $request): bool => $request->method() === 'PATCH'
            && str_contains(urldecode($request->url()), 'updated_at=eq.2026-10-23T01:00:00Z')
            && $request['product_id'] === 1 && $request['stock_quantity'] === 10);
    }

    public function test_returns_404_for_a_variant_of_another_product(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/products*' => Http::response([['id' => 1, 'variants' => [], 'images' => []]])]);

        $this->deleteJson('/api/admin/products/1/variants/2', ['updated_at' => '2026-10-23T01:00:00Z'])->assertNotFound();

        Http::assertNotSent(fn (Request $request): bool => $request->method() === 'DELETE');
    }

    public function test_returns_409_for_an_inventory_conflict(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1, 'variants' => [['id' => 2]], 'images' => []]]),
            'https://supabase.test/rest/v1/product_variants*' => Http::response([]),
        ]);

        $this->putJson('/api/admin/products/1/variants/2', [...$this->variantPayload(), 'updated_at' => '2026-10-23T01:00:00Z'])->assertConflict();
    }

    public function test_returns_409_when_deleting_a_product_referenced_by_orders(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::sequence()->push([['id' => 1]])->push(['code' => '23503'], 409),
        ]);

        $this->deleteJson('/api/admin/products/1', ['updated_at' => '2026-10-23T01:00:00Z'])->assertConflict();
    }

    public function test_returns_422_for_a_duplicate_sku(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1, 'variants' => [], 'images' => []]]),
            'https://supabase.test/rest/v1/product_variants' => Http::response(['code' => '23505'], 409),
        ]);

        $this->postJson('/api/admin/products/1/variants', $this->variantPayload())->assertUnprocessable()->assertJsonValidationErrors(['sku']);
    }

    public function test_uploads_a_validated_image_and_records_its_description(): void
    {
        $this->authenticate();
        Storage::fake('public');
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1, 'variants' => [], 'images' => []]]),
            'https://supabase.test/rest/v1/product_images' => Http::response([['id' => 3]], 201),
        ]);
        $image = UploadedFile::fake()->createWithContent('tee.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF0sAAAAASUVORK5CYII='));

        $this->post('/api/admin/products/1/images', ['image' => $image, 'alt_text' => 'Black tee', 'display_order' => 0], ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.id', 3);

        Storage::disk('public')->assertExists('products/'.$image->hashName());
        Http::assertSent(fn (Request $request): bool => $request->method() === 'POST' && $request['alt_text'] === 'Black tee');
    }

    public function test_returns_422_for_an_svg_upload(): void
    {
        $this->authenticate();
        Storage::fake('public');

        $this->post('/api/admin/products/1/images', [
            'image' => UploadedFile::fake()->createWithContent('unsafe.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
            'alt_text' => 'Unsafe image', 'display_order' => 0,
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors(['image']);

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_returns_422_for_invalid_order_details_and_duplicate_items(): void
    {
        $this->authenticate();

        $this->postJson('/api/admin/orders', ['guest_email' => 'invalid', 'items' => [
            ['variant_id' => 1, 'quantity' => 0], ['variant_id' => 1, 'quantity' => 1],
        ]])->assertUnprocessable()->assertJsonValidationErrors(['guest_name', 'guest_email', 'shipping_address', 'items.0.variant_id', 'items.0.quantity']);

        Http::assertSentCount(2);
    }

    public function test_returns_422_when_the_order_transaction_rejects_stock(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/rpc/admin_save_order' => Http::response(['code' => 'P0001', 'message' => 'Insufficient stock for SKU TEE.'], 400)]);

        $this->postJson('/api/admin/orders', $this->orderPayload())->assertUnprocessable()->assertJsonValidationErrors(['operation']);

        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), '/rpc/admin_save_order') && $request['p_order_id'] === null
            && ! isset($request['p_payload']['total']) && $request['p_payload']['items'][0]['quantity'] === 2);
    }

    public function test_creates_an_order_using_the_transaction_response(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/rpc/admin_save_order' => Http::response('7'),
            'https://supabase.test/rest/v1/orders*' => Http::response([['id' => 7, 'total' => '950.00']], 200, ['Content-Range' => '0-0/1']),
        ]);

        $this->postJson('/api/admin/orders', [...$this->orderPayload(), 'total' => 1])
            ->assertCreated()->assertJsonPath('data.total', '950.00');

        Http::assertSent(fn (Request $request): bool => $request->method() === 'GET'
            && str_contains(urldecode($request->url()), 'deleted_at=is.null'));
    }

    public function test_deletes_an_order_through_the_transaction_function(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/rpc/admin_delete_order' => Http::response('7')]);

        $this->deleteJson('/api/admin/orders/7', ['updated_at' => '2026-10-23T01:00:00Z'])->assertNoContent();

        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), '/rpc/admin_delete_order') && $request['p_order_id'] === 7 && $request['p_expected_updated_at'] === '2026-10-23T01:00:00Z');
    }

    public function test_filters_and_paginates_products_on_the_server(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/products*' => Http::response([], 200, ['Content-Range' => '*/25'])]);

        $this->getJson('/api/admin/products?search=tee&status=archived&page=2&per_page=12')
            ->assertOk()->assertJsonPath('meta.page', 2)->assertJsonPath('meta.last_page', 3);

        Http::assertSent(fn (Request $request): bool => str_contains(urldecode($request->url()), 'name=ilike.*tee*')
            && str_contains(urldecode($request->url()), 'status=eq.archived')
            && str_contains($request->url(), 'offset=12'));
    }

    public static function staleProductPages(): array
    {
        return [
            'one remaining page' => [4, 1],
            'multiple remaining pages' => [13, 2],
            'no remaining products' => [0, 1],
        ];
    }

    #[DataProvider('staleProductPages')]
    public function test_recovers_stale_product_pages_without_losing_filters(int $total, int $lastPage): void
    {
        $this->authenticate();
        $rows = $total === 0 ? [] : [['id' => 1, 'variants' => []]];
        $range = $total === 0 ? '*/0' : (($lastPage - 1) * 12).'-'.(($lastPage - 1) * 12).'/'.$total;
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::sequence()
                ->push(['code' => 'PGRST103', 'message' => 'Requested range not satisfiable'], 416, ['Content-Range' => '*/'.$total])
                ->push($rows, 200, ['Content-Range' => $range]),
        ]);

        $this->getJson('/api/admin/products?search=tee&status=archived&page=3&per_page=12')
            ->assertOk()->assertJsonPath('meta.page', $lastPage)
            ->assertJsonPath('meta.last_page', $lastPage)->assertJsonPath('meta.total', $total)
            ->assertJsonCount(count($rows), 'data');

        Http::assertSentCount(4);
        Http::assertSent(fn (Request $request): bool => str_contains(urldecode($request->url()), 'name=ilike.*tee*')
            && str_contains(urldecode($request->url()), 'status=eq.archived')
            && str_contains($request->url(), 'offset='.(($lastPage - 1) * 12)));
    }

    public function test_reports_product_service_failures_without_returning_empty_inventory(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/products*' => Http::response(['code' => '42P01'], 400)]);

        $this->getJson('/api/admin/products')->assertStatus(503)
            ->assertJsonPath('message', 'Store operations are temporarily unavailable. Please try again.')
            ->assertJsonMissingPath('data');

        Http::assertSentCount(3);
    }

    public function test_returns_422_for_filter_injection_and_invalid_status(): void
    {
        $this->authenticate();

        $this->getJson('/api/admin/orders?search='.urlencode('x),status.eq.completed').'&status=draft')
            ->assertUnprocessable()->assertJsonValidationErrors(['search', 'status']);

        Http::assertSentCount(2);
    }

    public function test_returns_422_without_an_update_version(): void
    {
        $this->authenticate();

        $this->putJson('/api/admin/products/1', $this->productPayload())
            ->assertUnprocessable()->assertJsonValidationErrors(['updated_at']);

        Http::assertSentCount(2);
    }

    public function test_updates_a_product_without_overwriting_its_identifier(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/categories*' => Http::response([['id' => 1, 'name' => 'T-shirts']]),
            'https://supabase.test/rest/v1/products*' => Http::sequence()
                ->push([['id' => 1, 'published_at' => null]])
                ->push([['id' => 1, ...$this->productPayload()]]),
        ]);

        $this->putJson('/api/admin/products/1', [...$this->productPayload(), 'updated_at' => '2026-10-23T01:00:00Z', 'id' => 999])
            ->assertOk()->assertJsonPath('data.id', 1);

        Http::assertSent(fn (Request $request): bool => $request->method() === 'PATCH'
            && str_contains(urldecode($request->url()), 'id=eq.1') && ! isset($request['id']));
    }

    public function test_deletes_an_unused_product(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::sequence()->push([['id' => 1]])->push([['id' => 1]]),
        ]);

        $this->deleteJson('/api/admin/products/1', ['updated_at' => '2026-10-23T01:00:00Z'])->assertNoContent();

        Http::assertSent(fn (Request $request): bool => $request->method() === 'DELETE' && str_contains(urldecode($request->url()), 'id=eq.1'));
    }

    public function test_cleans_up_an_upload_when_its_database_write_fails(): void
    {
        $this->authenticate();
        Storage::fake('public');
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1]]),
            'https://supabase.test/rest/v1/product_images' => Http::response(['code' => '42501'], 403),
        ]);
        $image = UploadedFile::fake()->createWithContent('tee.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF0sAAAAASUVORK5CYII='));

        $this->post('/api/admin/products/1/images', ['image' => $image, 'alt_text' => 'Black tee', 'display_order' => 0], ['Accept' => 'application/json'])->assertForbidden();

        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_changes_image_description_and_display_order(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1, 'images' => [['id' => 3]]]]),
            'https://supabase.test/rest/v1/product_images*' => Http::response([['id' => 3, 'alt_text' => 'Back of tee', 'display_order' => 2]]),
        ]);

        $this->putJson('/api/admin/products/1/images/3', ['alt_text' => 'Back of tee', 'display_order' => 2, 'updated_at' => '2026-10-23T01:00:00Z'])
            ->assertOk()->assertJsonPath('data.display_order', 2);

        Http::assertSent(fn (Request $request): bool => $request->method() === 'PATCH' && $request['alt_text'] === 'Back of tee');
    }

    public function test_updates_an_order_with_the_expected_version(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/rpc/admin_save_order' => Http::response('7'),
            'https://supabase.test/rest/v1/orders*' => Http::response([['id' => 7, 'status' => 'confirmed']], 200, ['Content-Range' => '0-0/1']),
        ]);

        $this->putJson('/api/admin/orders/7', [...$this->orderPayload(), 'status' => 'confirmed', 'updated_at' => '2026-10-23T01:00:00Z'])
            ->assertOk()->assertJsonPath('data.status', 'confirmed');

        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), '/rpc/admin_save_order')
            && $request['p_order_id'] === 7 && $request['p_expected_updated_at'] === '2026-10-23T01:00:00Z');
    }

    public function test_account_overview_loads_before_the_soft_delete_schema_update(): void
    {
        $this->authenticate('customer');
        Http::fake([
            'https://supabase.test/rest/v1/orders*' => Http::sequence()
                ->push(['code' => '42703', 'message' => 'column orders.deleted_at does not exist'], 400)
                ->push([['id' => 7]], 200, ['Content-Range' => '0-0/1']),
            'https://supabase.test/rest/v1/wishlist_items*' => Http::response([], 200, ['Content-Range' => '*/0']),
            'https://supabase.test/rest/v1/addresses*' => Http::response([], 200, ['Content-Range' => '*/0']),
        ]);

        $this->getJson('/api/account')->assertOk()
            ->assertJsonPath('data.stats.orders', 1)->assertJsonPath('data.recent_orders.0.id', 7);

        Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/rest/v1/orders?')
            && ! str_contains($request->url(), 'deleted_at')
            && str_contains(urldecode($request->url()), 'user_id=eq.'.self::USER_ID)
            && $request->hasHeader('Authorization', 'Bearer admin-session')
            && $request->hasHeader('Prefer', 'count=exact'));
    }

    public function test_legacy_order_retry_preserves_pagination_and_admin_filters(): void
    {
        $this->authenticate();
        Http::fake([
            'https://supabase.test/rest/v1/orders*' => Http::sequence()
                ->push(['code' => '42703', 'message' => 'column orders.deleted_at does not exist'], 400)
                ->push([['id' => 7]], 200, ['Content-Range' => '12-12/13']),
        ]);

        $this->getJson('/api/admin/orders?status=confirmed&page=2&per_page=12')
            ->assertOk()->assertJsonPath('meta.total', 13)->assertJsonPath('meta.page', 2);

        Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/rest/v1/orders?')
            && ! str_contains($request->url(), 'deleted_at')
            && str_contains(urldecode($request->url()), 'status=eq.confirmed')
            && str_contains($request->url(), 'offset=12'));
    }

    public function test_legacy_order_detail_retry_preserves_customer_ownership(): void
    {
        $this->authenticate('customer');
        Http::fake([
            'https://supabase.test/rest/v1/orders*' => Http::sequence()
                ->push(['code' => '42703', 'message' => 'column orders.deleted_at does not exist'], 400)
                ->push([], 200, ['Content-Range' => '*/0']),
        ]);

        $this->getJson('/api/account/orders/99')->assertNotFound();

        Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/rest/v1/orders?')
            && ! str_contains($request->url(), 'deleted_at')
            && str_contains(urldecode($request->url()), 'user_id=eq.'.self::USER_ID)
            && str_contains(urldecode($request->url()), 'id=eq.99'));
    }

    public function test_order_reads_keep_soft_delete_filter_after_the_schema_update(): void
    {
        $this->authenticate('customer');
        Http::fake(['https://supabase.test/rest/v1/orders*' => Http::response([], 200, ['Content-Range' => '*/0'])]);

        $this->getJson('/api/account/orders')->assertOk()->assertJsonPath('meta.total', 0);

        Http::assertSentCount(3);
        Http::assertSent(fn (Request $request): bool => str_contains(urldecode($request->url()), 'deleted_at=is.null'));
    }

    public function test_unrelated_missing_columns_do_not_retry_without_the_soft_delete_filter(): void
    {
        $this->authenticate();
        Http::fake(['https://supabase.test/rest/v1/orders*' => Http::response([
            'code' => '42703', 'message' => 'column orders.total does not exist',
        ], 400)]);

        $this->getJson('/api/admin/orders')->assertStatus(503);
        Http::assertSentCount(3);
    }

    public function test_uploads_to_cloudinary_and_stores_the_https_delivery_url(): void
    {
        $this->authenticate();
        $this->configureCloudinary();
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1]]),
            'https://api.cloudinary.com/v1_1/test-cloud/image/upload' => function (Request $request) {
                return Http::response([
                    'public_id' => collect($request->data())->firstWhere('name', 'public_id')['contents'],
                    'secure_url' => 'https://res.cloudinary.com/test-cloud/image/upload/tee.png',
                ]);
            },
            'https://supabase.test/rest/v1/product_images' => Http::response([['id' => 3]], 201),
        ]);

        $this->post('/api/admin/products/1/images', $this->imagePayload(), ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('data.id', 3);

        Http::assertSent(fn (Request $request): bool => str_contains($request->url(), 'api.cloudinary.com')
            && $request->hasHeader('Authorization', 'Basic '.base64_encode('test-key:test-secret'))
            && $request->hasFile('file') && str_starts_with(collect($request->data())->firstWhere('name', 'public_id')['contents'], 'legendary/products/'));
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://supabase.test/rest/v1/product_images'
            && $request['image_url'] === 'https://res.cloudinary.com/test-cloud/image/upload/tee.png'
            && ! isset($request['api_secret']));
    }

    public function test_cloudinary_failure_does_not_create_an_image_record(): void
    {
        $this->authenticate();
        $this->configureCloudinary();
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1]]),
            'https://api.cloudinary.com/*' => Http::response(['error' => ['message' => 'test-secret']], 401),
        ]);

        $this->post('/api/admin/products/1/images', $this->imagePayload(), ['Accept' => 'application/json'])
            ->assertStatus(503)->assertDontSee('test-secret');

        Http::assertNotSent(fn (Request $request): bool => str_contains($request->url(), '/rest/v1/product_images'));
    }

    public function test_cleans_up_cloudinary_after_a_database_write_failure(): void
    {
        $this->authenticate();
        $this->configureCloudinary();
        $publicId = null;
        Http::fake([
            'https://supabase.test/rest/v1/products*' => Http::response([['id' => 1]]),
            'https://api.cloudinary.com/v1_1/test-cloud/image/upload' => function (Request $request) use (&$publicId) {
                $publicId = collect($request->data())->firstWhere('name', 'public_id')['contents'];

                return Http::response([
                    'public_id' => $publicId,
                    'secure_url' => 'https://res.cloudinary.com/test-cloud/image/upload/tee.png',
                ]);
            },
            'https://api.cloudinary.com/v1_1/test-cloud/image/destroy' => Http::response(['result' => 'ok']),
            'https://supabase.test/rest/v1/product_images' => Http::response(['code' => '42501'], 403),
        ]);

        $this->post('/api/admin/products/1/images', $this->imagePayload(), ['Accept' => 'application/json'])->assertForbidden();

        Http::assertSent(fn (Request $request): bool => str_ends_with($request->url(), '/image/destroy')
            && $publicId !== null && $request['public_id'] === $publicId && $request['invalidate'] === 'true');
    }

    public function test_missing_cloudinary_credentials_fail_without_writing_locally(): void
    {
        $this->authenticate();
        Storage::fake('public');
        config(['services.product_images.driver' => 'cloudinary', 'services.cloudinary.api_key' => null]);
        Http::fake(['https://supabase.test/rest/v1/products*' => Http::response([['id' => 1]])]);

        $this->post('/api/admin/products/1/images', $this->imagePayload(), ['Accept' => 'application/json'])->assertStatus(503);

        $this->assertSame([], Storage::disk('public')->allFiles());
        Http::assertSentCount(3);
    }

    private function configureCloudinary(): void
    {
        config([
            'services.product_images.driver' => 'cloudinary',
            'services.cloudinary.cloud_name' => 'test-cloud',
            'services.cloudinary.api_key' => 'test-key',
            'services.cloudinary.api_secret' => 'test-secret',
            'services.cloudinary.folder' => 'legendary/products',
        ]);
    }

    private function imagePayload(): array
    {
        return [
            'image' => UploadedFile::fake()->createWithContent('tee.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF0sAAAAASUVORK5CYII=')),
            'alt_text' => 'Black tee', 'display_order' => 0,
        ];
    }

    private function authenticate(string $role = 'admin'): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'https://supabase.test/auth/v1/user' => Http::response(['id' => self::USER_ID]),
            'https://supabase.test/rest/v1/users*' => Http::response([['id' => self::USER_ID, 'name' => 'Test user', 'email' => 'test@example.com', 'role' => $role]]),
        ]);
        $this->withSession(['supabase' => ['access_token' => 'admin-session', 'user_id' => self::USER_ID]]);
    }

    private function productPayload(): array
    {
        return ['name' => 'Everyday tee', 'slug' => 'everyday-tee', 'category_id' => 1, 'base_price' => '500.00',
            'sale_price' => null, 'status' => 'draft', 'is_featured' => false, 'is_new_arrival' => true];
    }

    private function variantPayload(): array
    {
        return ['color' => 'Black', 'sku' => 'TEE-BLK-M', 'size' => 'M', 'stock_quantity' => 10, 'low_stock_threshold' => 5, 'is_active' => true];
    }

    private function orderPayload(): array
    {
        return ['guest_name' => 'Test buyer', 'guest_email' => 'buyer@example.com', 'guest_phone' => '09123456789',
            'status' => 'pending', 'payment_method' => 'Cash on delivery', 'payment_status' => 'pending',
            'shipping_fee' => 50, 'discount_amount' => 100, 'shipping_address' => [
                'recipient_name' => 'Test buyer', 'phone' => '09123456789', 'address_line_1' => '1 Test Street',
                'city' => 'Manila', 'province' => 'Metro Manila', 'postal_code' => '1000', 'country' => 'PH',
            ], 'items' => [['variant_id' => 1, 'quantity' => 2]]];
    }
}

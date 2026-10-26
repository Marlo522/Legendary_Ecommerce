<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminImageRequest;
use App\Http\Requests\AdminOrderRequest;
use App\Http\Requests\AdminProductRequest;
use App\Http\Requests\AdminVariantRequest;
use App\Repositories\AdminRepository;
use App\Repositories\PortalRepository;
use App\Services\AdminService;
use App\Services\ProductImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AdminManagementController extends Controller
{
    public function __construct(
        private AdminRepository $data,
        private AdminService $admin,
        private PortalRepository $portal,
        private ProductImageStorage $images,
    ) {}

    public function categories(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->data->categories($this->token($request))]);
    }

    public function product(Request $request, int $product): JsonResponse
    {
        return response()->json(['data' => $this->data->product($this->token($request), $product)]);
    }

    public function storeProduct(AdminProductRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->admin->saveProduct($this->token($request), $request->validated())], 201);
    }

    public function updateProduct(AdminProductRequest $request, int $product): JsonResponse
    {
        return response()->json(['data' => $this->admin->saveProduct($this->token($request), $request->validated(), $product)]);
    }

    public function deleteProduct(Request $request, int $product): Response
    {
        $values = $request->validate(['updated_at' => ['required', 'date']]);
        $this->data->product($this->token($request), $product);
        $this->data->write($this->token($request), 'DELETE', 'products', [], [
            'id' => 'eq.'.$product, 'updated_at' => 'eq.'.$values['updated_at'],
        ]);

        return response()->noContent();
    }

    public function storeVariant(AdminVariantRequest $request, int $product): JsonResponse
    {
        return response()->json(['data' => $this->admin->saveVariant($this->token($request), $product, $request->validated())], 201);
    }

    public function updateVariant(AdminVariantRequest $request, int $product, int $variant): JsonResponse
    {
        return response()->json(['data' => $this->admin->saveVariant($this->token($request), $product, $request->validated(), $variant)]);
    }

    public function deleteVariant(Request $request, int $product, int $variant): Response
    {
        $values = $request->validate(['updated_at' => ['required', 'date']]);
        $this->admin->deleteChild($this->token($request), $product, 'product_variants', $variant, $values['updated_at']);

        return response()->noContent();
    }

    public function storeImage(AdminImageRequest $request, int $product): JsonResponse
    {
        $this->data->product($this->token($request), $product);
        $stored = $this->images->store($request->file('image'));
        try {
            $image = $this->data->write($this->token($request), 'POST', 'product_images', [
                'product_id' => $product, 'image_url' => $stored['url'],
                'alt_text' => $request->validated('alt_text'), 'display_order' => $request->integer('display_order'),
            ]);
        } catch (\Throwable $exception) {
            try {
                $this->images->discard($stored);
            } catch (\Throwable) {
                Log::warning('Image cleanup failed after a database write failure.', [
                    'driver' => $stored['driver'], 'path' => $stored['path'],
                ]);
            }
            throw $exception;
        }

        return response()->json(['data' => $image], 201);
    }

    public function updateImage(Request $request, int $product, int $image): JsonResponse
    {
        $values = $request->validate([
            'alt_text' => ['required', 'string', 'max:255'],
            'display_order' => ['required', 'integer', 'min:0', 'max:1000'],
            'updated_at' => ['required', 'date'],
        ]);
        $record = $this->data->product($this->token($request), $product);
        abort_unless(in_array($image, array_column($record['images'], 'id')), 404, 'Image not found.');
        $expected = $values['updated_at'];
        $values['updated_at'] = now()->toISOString();

        return response()->json(['data' => $this->data->write($this->token($request), 'PATCH', 'product_images', $values, [
            'id' => 'eq.'.$image, 'product_id' => 'eq.'.$product, 'updated_at' => 'eq.'.$expected,
        ])]);
    }

    public function deleteImage(Request $request, int $product, int $image): Response
    {
        $values = $request->validate(['updated_at' => ['required', 'date']]);
        $this->admin->deleteChild($this->token($request), $product, 'product_images', $image, $values['updated_at']);

        return response()->noContent();
    }

    public function storeOrder(AdminOrderRequest $request): JsonResponse
    {
        $id = $this->data->orderWrite($this->token($request), 'admin_save_order', [
            'p_order_id' => null, 'p_payload' => $request->validated(), 'p_expected_updated_at' => null,
        ]);

        return response()->json(['data' => $this->portal->order($this->token($request), $id)], 201);
    }

    public function updateOrder(AdminOrderRequest $request, int $order): JsonResponse
    {
        $values = $request->validated();
        $expected = $values['updated_at'];
        unset($values['updated_at']);
        $id = $this->data->orderWrite($this->token($request), 'admin_save_order', [
            'p_order_id' => $order, 'p_payload' => $values, 'p_expected_updated_at' => $expected,
        ]);

        return response()->json(['data' => $this->portal->order($this->token($request), $id)]);
    }

    public function deleteOrder(Request $request, int $order): Response
    {
        $values = $request->validate(['updated_at' => ['required', 'date']]);
        $this->data->orderWrite($this->token($request), 'admin_delete_order', [
            'p_order_id' => $order, 'p_expected_updated_at' => $values['updated_at'],
        ]);

        return response()->noContent();
    }

    private function token(Request $request): string
    {
        return $request->session()->get('supabase.access_token');
    }
}

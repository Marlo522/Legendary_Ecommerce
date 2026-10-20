<?php

namespace App\Http\Controllers;

use App\Repositories\CatalogRepository;
use App\Support\SupabaseClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function __construct(private SupabaseClient $supabase, private CatalogRepository $catalog) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9_-]+$/'],
            'saved' => ['required', 'boolean'],
        ]);
        $product = $this->catalog->product($data['slug']);
        $token = $request->session()->get('supabase.access_token');
        $userId = $request->user()->getAuthIdentifier();
        if ($data['saved']) {
            $response = $this->supabase->request('POST', '/rest/v1/wishlist_items?on_conflict=user_id,product_id', [
                'user_id' => $userId, 'product_id' => $product['id'],
            ], $token, ['Prefer' => 'resolution=ignore-duplicates,return=minimal']);
        } else {
            $response = $this->supabase->request('DELETE', '/rest/v1/wishlist_items?'.http_build_query([
                'user_id' => 'eq.'.$userId, 'product_id' => 'eq.'.$product['id'],
            ]), [], $token);
        }
        abort_if($response->status() === 401, 401, 'Your session has expired. Please log in again.');
        abort_unless($response->successful(), 503, 'Your saved pieces could not be updated.');

        return response()->json(['data' => ['saved' => $data['saved']]]);
    }
}

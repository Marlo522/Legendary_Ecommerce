<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageStorage
{
    /** @return array{driver: string, path: string, url: string} */
    public function store(UploadedFile $file): array
    {
        $driver = config('services.product_images.driver', 'local');
        abort_unless(in_array($driver, ['local', 'cloudinary'], true), 503, 'Image storage is not configured.');

        if ($driver === 'local') {
            $path = $file->store('products', 'public');
            abort_if($path === false, 503, 'The image could not be saved.');

            return ['driver' => 'local', 'path' => $path, 'url' => Storage::disk('public')->url($path)];
        }

        $publicId = trim((string) config('services.cloudinary.folder'), '/').'/'.Str::uuid();
        try {
            $response = $this->cloudinary()->attach('file', $file->get(), $file->getClientOriginalName())
                ->post($this->endpoint('upload'), ['public_id' => $publicId, 'overwrite' => 'false']);
        } catch (ConnectionException) {
            abort(503, 'Image storage is temporarily unavailable.');
        }

        if (in_array($response->status(), [401, 403], true)) {
            $cloudNameMismatch = $response->json('error.message') === 'cloud_name mismatch';
            Log::warning('Cloudinary image upload authentication failed.', [
                'status' => $response->status(),
                'reason' => $cloudNameMismatch ? 'cloud_name_mismatch' : 'credentials_rejected',
            ]);
            abort(503, $cloudNameMismatch
                ? 'Cloudinary credentials do not match the configured cloud name. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.'
                : 'Cloudinary rejected the image storage credentials. Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env.');
        }

        $url = $response->json('secure_url');
        abort_unless($response->successful() && $response->json('public_id') === $publicId
            && is_string($url) && filter_var($url, FILTER_VALIDATE_URL)
            && parse_url($url, PHP_URL_SCHEME) === 'https', 503, 'The image could not be uploaded.');

        return ['driver' => 'cloudinary', 'path' => $publicId, 'url' => $url];
    }

    /** @param array{driver: string, path: string, url: string} $image */
    public function discard(array $image): void
    {
        if ($image['driver'] === 'local') {
            abort_unless(Storage::disk('public')->delete($image['path']), 503, 'Image cleanup failed.');

            return;
        }

        try {
            $response = $this->cloudinary()->asForm()->post($this->endpoint('destroy'), [
                'public_id' => $image['path'], 'invalidate' => 'true',
            ]);
        } catch (ConnectionException) {
            abort(503, 'Image cleanup is temporarily unavailable.');
        }

        abort_unless($response->successful() && in_array($response->json('result'), ['ok', 'not found'], true),
            503, 'Image cleanup failed.');
    }

    private function cloudinary(): PendingRequest
    {
        $key = config('services.cloudinary.api_key');
        $secret = config('services.cloudinary.api_secret');
        abort_unless(is_string($key) && $key !== '' && is_string($secret) && $secret !== '',
            503, 'Image storage is not configured.');

        return Http::withBasicAuth($key, $secret)->acceptJson()
            ->connectTimeout(5)->timeout(30)->withoutRedirecting();
    }

    private function endpoint(string $action): string
    {
        $cloud = config('services.cloudinary.cloud_name');
        abort_unless(is_string($cloud) && preg_match('/^[a-zA-Z0-9_-]+$/', $cloud),
            503, 'Image storage is not configured.');

        return 'https://api.cloudinary.com/v1_1/'.$cloud.'/image/'.$action;
    }
}

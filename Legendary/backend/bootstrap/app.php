<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $exception, Request $request): ?Response {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($exception instanceof ValidationException) {
                return response()->json([
                    'message' => $exception->getMessage(),
                    'errors' => $exception->errors(),
                ], $exception->status);
            }

            $status = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;
            $headers = $exception instanceof HttpExceptionInterface ? $exception->getHeaders() : [];
            $imageStorageMessages = [
                'Cloudinary credentials do not match the configured cloud name. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.',
                'Cloudinary rejected the image storage credentials. Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env.',
                'Image storage is not configured.',
                'Image storage is temporarily unavailable.',
                'The image could not be uploaded.',
                'The image could not be saved.',
            ];
            if ($status === 503 && $request->isMethod('POST') && $request->is('api/admin/products/*/images')
                && in_array($exception->getMessage(), $imageStorageMessages, true)) {
                return response()->json([
                    'message' => $exception->getMessage(), 'code' => 'image_storage_unavailable',
                ], $status, $headers);
            }
            $unavailableMessage = match (true) {
                $request->is('api/auth/*') => 'Authentication is temporarily unavailable.',
                $request->is('api/catalog/*') => 'The catalog is temporarily unavailable.',
                $request->is('api/admin/*') => 'Store operations are temporarily unavailable. Please try again.',
                default => 'Account data is temporarily unavailable.',
            };
            $message = $status >= 500
                ? ($status === 503 ? $unavailableMessage : 'An unexpected error occurred.')
                : ($exception->getMessage() ?: (Response::$statusTexts[$status] ?? 'Request failed.'));

            return response()->json(['message' => $message], $status, $headers);
        });

        $exceptions->respond(function (Response $response): Response {
            if (request()->is('api/*')) {
                $response->headers->set('Cache-Control', 'no-store, private');
                $response->headers->set('Pragma', 'no-cache');
                $response->headers->set('X-Content-Type-Options', 'nosniff');
            }

            return $response;
        });
    })->create();

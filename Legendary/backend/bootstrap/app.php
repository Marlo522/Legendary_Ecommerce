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
            $message = $status >= 500
                ? ($status === 503 ? ($request->is('api/auth/*') ? 'Authentication is temporarily unavailable.' : ($request->is('api/catalog/*') ? 'The catalog is temporarily unavailable.' : 'Account data is temporarily unavailable.')) : 'An unexpected error occurred.')
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

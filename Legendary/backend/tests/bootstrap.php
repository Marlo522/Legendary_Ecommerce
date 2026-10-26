<?php

putenv('APP_ENV=testing');
putenv('CACHE_STORE=array');
require __DIR__.'/../vendor/autoload.php';

spl_autoload_register(function (string $class): void {
    if (str_starts_with($class, 'Tests\\')) {
        $path = __DIR__.'/'.str_replace('\\', '/', substr($class, 6)).'.php';
        if (is_file($path)) {
            require $path;
        }
    }
});

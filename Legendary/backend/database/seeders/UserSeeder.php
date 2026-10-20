<?php

namespace Database\Seeders;

use App\Support\SupabaseAdminClient;
use Database\Seeders\Support\DemoSeeder;
use Illuminate\Support\Str;
use RuntimeException;

class UserSeeder extends DemoSeeder
{
    protected function seed(): void
    {
        $accounts = config('demo_seeding.users');
        foreach ($accounts as $account) {
            if (! is_string($account['email']) || ! filter_var($account['email'], FILTER_VALIDATE_EMAIL)
                || ! is_string($account['password']) || strlen($account['password']) < 12) {
                throw new RuntimeException('Set valid demo emails and DEMO_ADMIN_PASSWORD / DEMO_CUSTOMER_PASSWORD with at least 12 characters before seeding.');
            }
        }
        if (strtolower($accounts['admin']['email']) === strtolower($accounts['customer']['email'])) {
            throw new RuntimeException('Demo administrator and customer emails must be different.');
        }

        $client = app(SupabaseAdminClient::class);
        $existing = [];
        $page = 1;
        do {
            $result = $client->request('GET', '/auth/v1/admin/users', [], ['page' => $page++, 'per_page' => 100]);
            $users = $result['users'] ?? null;
            if (! is_array($users)) {
                throw new RuntimeException('Supabase returned an invalid Auth user listing.');
            }
            foreach ($users as $user) {
                foreach ($accounts as $account) {
                    if (strtolower($user['email'] ?? '') === strtolower($account['email'])) {
                        if (($user['app_metadata']['legendary_demo_seed'] ?? false) !== true) {
                            throw new RuntimeException('A configured demo email belongs to an existing non-demo account. Choose unused demo emails; no account has been overwritten.');
                        }
                        $existing[strtolower($account['email'])] = $user;
                    }
                }
            }
        } while (count($users) === 100);

        foreach ($accounts as $role => $account) {
            $email = strtolower($account['email']);
            $user = $existing[$email] ?? null;
            $payload = [
                'email' => $email,
                'password' => $account['password'],
                'email_confirm' => true,
                'user_metadata' => ['name' => $account['name']],
            ];
            if ($user === null) {
                $payload['app_metadata'] = ['legendary_demo_seed' => true];
            }
            $result = $client->request(
                $user === null ? 'POST' : 'PUT',
                '/auth/v1/admin/users'.($user === null ? '' : '/'.$user['id']),
                $payload,
            );
            if (! is_string($result['id'] ?? null) || ! Str::isUuid($result['id'])
                || strtolower($result['email'] ?? '') !== $email
                || empty($result['email_confirmed_at'])) {
                throw new RuntimeException('Supabase did not return a confirmed demo Auth account.');
            }

            $this->data->save('users', ['id' => $result['id']], [
                'name' => $account['name'], 'email' => $email, 'role' => $role,
            ]);
        }
    }
}

# ISH News — MW Admin (Laravel)

Laravel + Inertia + React mwadmin for ISH News, with legacy session auth and module permissions.

## Local development

- PHP 8.2+, Composer, Node 20+, MySQL
- Copy `.env.example` to `.env`, set `APP_URL` and `DB_*`, then `composer install`, `npm install`, `php artisan key:generate`
- `npm run dev` with `php artisan serve` (or your preferred host/port)

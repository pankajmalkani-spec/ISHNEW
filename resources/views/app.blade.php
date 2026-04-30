<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="icon" type="image/png" sizes="100x100" href="/images/ish-news-logo.png?v={{ file_exists(public_path('images/ish-news-logo.png')) ? filemtime(public_path('images/ish-news-logo.png')) : '1' }}">
        <link rel="shortcut icon" type="image/png" href="/images/ish-news-logo.png?v={{ file_exists(public_path('images/ish-news-logo.png')) ? filemtime(public_path('images/ish-news-logo.png')) : '1' }}">
        <link rel="apple-touch-icon" href="/images/ish-news-logo.png?v={{ file_exists(public_path('images/ish-news-logo.png')) ? filemtime(public_path('images/ish-news-logo.png')) : '1' }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @viteReactRefresh
        @vite(['resources/js/app.jsx', 'resources/css/app.css'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>

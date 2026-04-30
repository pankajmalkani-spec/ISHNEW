<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
@php
    $assetVersion = static function (string $path): string {
        $fullPath = public_path(ltrim($path, '/'));

        return file_exists($fullPath) ? (string) filemtime($fullPath) : '1';
    };
@endphp
<link rel="stylesheet" href="{{ url('/assets/css/modernmag-assets.min.css') }}?v={{ $assetVersion('/assets/css/modernmag-assets.min.css') }}">
<link rel="stylesheet" type="text/css" href="{{ url('/assets/css/style.css') }}?v={{ $assetVersion('/assets/css/style.css') }}">
@if(($frontendTheme ?? 'legacy') === 'modern')
<link rel="stylesheet" type="text/css" href="{{ url('/assets/css/theme-modern.css') }}?v={{ $assetVersion('/assets/css/theme-modern.css') }}">
<link rel="stylesheet" type="text/css" href="{{ url('/assets/css/home-modern.css') }}?v={{ $assetVersion('/assets/css/home-modern.css') }}">
@else
<link rel="stylesheet" type="text/css" href="{{ url('/assets/css/theme-legacy.css') }}?v={{ $assetVersion('/assets/css/theme-legacy.css') }}">
@endif
<script src="{{ url('/assets/js/lazysizes.min.js') }}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.0/jquery.min.js"></script>
	<link rel="icon" type="image/png" sizes="100x100" href="{{ url('/images/ish-news-logo.png') }}?v={{ $assetVersion('/images/ish-news-logo.png') }}">
	<link rel="shortcut icon" type="image/png" href="{{ url('/images/ish-news-logo.png') }}?v={{ $assetVersion('/images/ish-news-logo.png') }}">
	<link rel="apple-touch-icon" href="{{ url('/images/ish-news-logo.png') }}?v={{ $assetVersion('/images/ish-news-logo.png') }}">

<?php

namespace App\Support;

/**
 * Resolves public URLs for legacy frontend assets under {@see public_path('images')}.
 * When a DB filename is missing or the file is not on disk, uses the same placeholders as CodeIgniter mwadmin.
 */
class FrontendMedia
{
    public const COVER_FALLBACK = 'no_img.png';

    public const SPONSOR_FALLBACK = 'no_img.png';

    /** @var non-empty-string */
    private const COVER_DIR = 'images/NewsContents/coverImages';

    /** @var non-empty-string */
    private const SPONSOR_DIR = 'images/sponsorLogo';

    public static function coverImageUrl(?string $storedFilename, ?string $youtubeUrl = null): string
    {
        $name = self::resolveExistingBasename((string) ($storedFilename ?? ''), public_path(self::COVER_DIR), self::COVER_FALLBACK);

        if ($name === self::COVER_FALLBACK && !empty($youtubeUrl)) {
            if ($id = self::youtubeId($youtubeUrl)) {
                return self::youtubeThumbnailUrl($id, 'mqdefault');
            }
        }

        return url(self::COVER_DIR.'/'.$name);
    }

    public static function heroImageUrl(?string $storedFilename, ?string $youtubeUrl = null): string
    {
        $name = self::resolveExistingBasename((string) ($storedFilename ?? ''), public_path(self::COVER_DIR), self::COVER_FALLBACK);

        if ($name === self::COVER_FALLBACK && !empty($youtubeUrl)) {
            if ($id = self::youtubeId($youtubeUrl)) {
                return self::youtubeThumbnailUrl($id, 'maxresdefault');
            }
        }

        return url(self::COVER_DIR.'/'.$name);
    }

    public static function heroImageFallbackUrl(?string $youtubeUrl = null): string
    {
        if (!empty($youtubeUrl) && ($id = self::youtubeId($youtubeUrl))) {
            return self::youtubeThumbnailUrl($id, 'hqdefault');
        }

        return url(self::COVER_DIR.'/'.self::COVER_FALLBACK);
    }

    public static function sponsorLogoUrl(?string $storedFilename): string
    {
        $name = self::resolveExistingBasename((string) ($storedFilename ?? ''), public_path(self::SPONSOR_DIR), self::SPONSOR_FALLBACK);

        return url(self::SPONSOR_DIR.'/'.$name);
    }

    /**
     * Sidebar / frontend ads: {@see public_path('images/AdvertiseImages')}. Returns null if missing or invalid (no placeholder URL).
     */
    public static function advertisementImageUrlIfExists(?string $storedFilename): ?string
    {
        $trimmed = trim((string) ($storedFilename ?? ''));
        if ($trimmed === '' || preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]*$/', $trimmed) !== 1) {
            return null;
        }

        $lower = strtolower($trimmed);
        if ($lower === 'no_img.png' || $lower === 'no_img.gif') {
            return null;
        }

        $path = public_path('images/AdvertiseImages/'.$trimmed);

        return is_file($path) ? url('images/AdvertiseImages/'.$trimmed) : null;
    }

    /**
     * Static theme images under `public/images/` (about page, merchandise slider, etc.).
     * Uses the file from {@see public_path()} when present. Otherwise, if
     * {@see config('ishnews.theme_image_origin')} or {@see config('ishnews.public_images_fallback_base')}
     * is set (e.g. another dev server), loads from that origin; never defaults to a production host.
     *
     * @param  non-empty-string  $relativeWebPath  e.g. `images/box-about-problem.jpg`
     */
    public static function themeImageUrl(string $relativeWebPath): string
    {
        $relativeWebPath = ltrim(str_replace('\\', '/', $relativeWebPath), '/');
        if ($relativeWebPath === '' || str_contains($relativeWebPath, '..')) {
            return url('images/'.basename($relativeWebPath));
        }

        if (is_file(public_path($relativeWebPath))) {
            return url($relativeWebPath);
        }

        $origin = trim((string) config('ishnews.theme_image_origin', ''));
        if ($origin === '') {
            $origin = trim((string) config('ishnews.public_images_fallback_base', ''));
        }

        if ($origin !== '' && filter_var($origin, FILTER_VALIDATE_URL)) {
            return rtrim($origin, '/').'/'.$relativeWebPath;
        }

        return url($relativeWebPath);
    }

    private static function resolveExistingBasename(string $stored, string $absoluteDir, string $fallbackBasename): string
    {
        $trimmed = trim($stored);
        if ($trimmed === '') {
            return $fallbackBasename;
        }

        // DB stores a bare filename (legacy); reject path segments.
        if (preg_match('/^[A-Za-z0-9][A-Za-z0-9._-]*$/', $trimmed) !== 1) {
            return $fallbackBasename;
        }

        $path = $absoluteDir.'/'.$trimmed;

        return is_file($path) ? $trimmed : $fallbackBasename;
    }

    private static function youtubeId(string $youtubeUrl): ?string
    {
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i', $youtubeUrl, $matches)) {
            return $matches[1];
        }

        return null;
    }

    private static function youtubeThumbnailUrl(string $youtubeId, string $quality): string
    {
        return 'https://img.youtube.com/vi/'.$youtubeId.'/'.$quality.'.jpg';
    }
}

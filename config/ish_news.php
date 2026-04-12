<?php

return [

    /*
    |--------------------------------------------------------------------------
    | News media (cover / banner) base URL
    |--------------------------------------------------------------------------
    |
    | Files are historically stored under the legacy app's web root:
    |   {document_root}/images/NewsContents/coverImages/
    |
    | Laravel serves static files from public/images/. If those folders are not
    | present, either:
    | - Symlink legacy `images/NewsContents` → `public/images/NewsContents`, or
    | - Set this to the legacy site base that exposes /images (no trailing slash).
    |   Example: NEWS_IMAGES_BASE_URL=http://127.0.0.1:8080/images
    |
    */
    'images_base_url' => env('NEWS_IMAGES_BASE_URL'),

];

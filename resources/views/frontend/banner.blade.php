@if(!empty($banner) && count($banner) > 0)
<?php $main = 2; ?>
<div id="ish-featured" class="wide-news-heading">
  <div class="item main-news">
    <div class="flexslider">
      <ul class="slides">
        @for($i = 0; $i <= min($main-1, count($banner)-1); $i++)
          @php
            $imageUrl = \App\Support\FrontendMedia::heroImageUrl($banner[$i]->cover_img ?? null, $banner[$i]->youtube_url ?? null);
            $imageFallbackUrl = \App\Support\FrontendMedia::heroImageFallbackUrl($banner[$i]->youtube_url ?? null);
            $imagePath = parse_url($imageUrl, PHP_URL_PATH) ?: '';
            $isFallbackCover = \Illuminate\Support\Str::endsWith($imagePath, '/no_img.png');
            if ($isFallbackCover) {
                $imageUrl = \App\Support\FrontendMedia::themeImageUrl('images/box-news-on-tv.jpg');
                $imageFallbackUrl = $imageUrl;
            }
          @endphp
          <li>
            <div class="news-post large-image-post{{ $isFallbackCover ? ' ish-featured-fallback-cover' : '' }}">
              <img src="{{ $imageUrl }}" data-fallback-src="{{ $imageFallbackUrl }}" alt="{{ $banner[$i]->title ?? '' }}">
              <div class="hover-box">
                <a href="{{ url('/category/'.($banner[$i]->categorycode ?? '').'/'.($banner[$i]->subcategorycode ?? '')) }}" class="category category-{{ $banner[$i]->categorycode ?? '' }}">{{ $banner[$i]->categoryname ?? '' }}</a>
                <h2><a href="{{ url('/videos/'.($banner[$i]->categorycode ?? '').'/'.($banner[$i]->permalink ?? '')) }}" style="color: #ffffff !important;">{{ $banner[$i]->title ?? '' }}</a></h2>
              </div>
            </div>
          </li>
        @endfor
      </ul>
    </div>
  </div>
  @for($i = $main; $i <= count($banner)-1; $i++)
    @php
      $imageUrl = \App\Support\FrontendMedia::heroImageUrl($banner[$i]->cover_img ?? null, $banner[$i]->youtube_url ?? null);
      $imageFallbackUrl = \App\Support\FrontendMedia::heroImageFallbackUrl($banner[$i]->youtube_url ?? null);
      $imagePath = parse_url($imageUrl, PHP_URL_PATH) ?: '';
      $isFallbackCover = \Illuminate\Support\Str::endsWith($imagePath, '/no_img.png');
      if ($isFallbackCover) {
          $imageUrl = \App\Support\FrontendMedia::themeImageUrl('images/box-news-on-tv.jpg');
          $imageFallbackUrl = $imageUrl;
      }
    @endphp
    <div class="item">
      <div class="news-post image-post{{ $isFallbackCover ? ' ish-featured-fallback-cover' : '' }}">
        <a href="{{ url('/videos/'.($banner[$i]->categorycode ?? '').'/'.($banner[$i]->permalink ?? '')) }}">
          <img src="{{ $imageUrl }}" data-fallback-src="{{ $imageFallbackUrl }}" alt="{{ $banner[$i]->title ?? '' }}">
        </a>
        <div class="hover-box">
          <a href="{{ url('/category/'.($banner[$i]->categorycode ?? '').'/'.($banner[$i]->subcategorycode ?? '')) }}" class="category category-{{ $banner[$i]->categorycode ?? '' }}">{{ $banner[$i]->categoryname ?? '' }}</a>
        </div>
      </div>
    </div>
  @endfor
</div>
@endif

{{-- Modern home: dark shell; same data as legacy --}}
@php
  $bn = isset($CategorySet1[1]) ? $CategorySet1[1] : null;
  $modernBadgeStyle = static function ($item): string {
      $color = trim((string) (($item->subcategorycolor ?? null) ?: ($item->categorycolor ?? null) ?: '#232323'));
      if (! preg_match('/^#(?:[0-9a-fA-F]{3}){1,2}$/', $color)) {
          $color = '#232323';
      }

      $hex = ltrim($color, '#');
      if (strlen($hex) === 3) {
          $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
      }

      $brightness = ((hexdec(substr($hex, 0, 2)) * 299) + (hexdec(substr($hex, 2, 2)) * 587) + (hexdec(substr($hex, 4, 2)) * 114)) / 1000;
      $textColor = $brightness > 170 ? '#111111' : '#ffffff';

      return 'background-color: '.$color.' !important; color: '.$textColor.' !important;';
  };
@endphp

<style>
  .netflix-hero-slider {
    width: calc(100% - 32px);
    max-width: 1300px;
    position: relative;
    background-color: #000;
    margin: 0 auto 2rem;
    overflow: hidden;
    border-radius: 0 0 10px 10px;
  }
  .netflix-hero-image-wrapper {
    position: relative;
    width: 100%;
    height: clamp(340px, 44vw, 500px);
    min-height: 0;
    max-height: 560px;
    overflow: hidden;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .netflix-hero-image {
    width: auto !important;
    max-width: 62%;
    height: auto;
    max-height: 78%;
    margin-right: 7%;
    object-fit: contain;
    object-position: center;
  }
  .netflix-hero-vignette-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, #141414 0%, transparent 100%);
    z-index: 1;
  }
  .netflix-hero-vignette-left {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 60%;
    background: linear-gradient(to right, rgba(20,20,20,0.9) 0%, transparent 100%);
    z-index: 1;
  }
  .netflix-hero-caption {
    position: absolute;
    bottom: 10%;
    left: 4%;
    right: 35%;
    z-index: 2;
    padding: 0;
  }
  .netflix-hero-category {
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    display: inline-block;
  }
  #content-section h1.netflix-hero-title,
  .netflix-hero-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    line-height: 1.1;
    color: #ffffff !important;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
    margin-bottom: 20px;
  }
  .netflix-btn-play {
    background-color: white;
    color: black;
    font-weight: bold;
    border-radius: 4px;
    padding: 10px 30px;
    font-size: 1.2rem;
    border: none;
    transition: all 0.2s ease;
  }
  .netflix-btn-play:hover {
    background-color: rgba(255, 255, 255, 0.75);
    color: black;
  }
  .netflix-btn-more {
    background-color: rgba(109, 109, 110, 0.7);
    color: white;
    font-weight: bold;
    border-radius: 4px;
    padding: 10px 30px;
    font-size: 1.2rem;
    border: none;
    transition: all 0.2s ease;
  }
  .netflix-btn-more:hover {
    background-color: rgba(109, 109, 110, 0.4);
    color: white;
  }
  .netflix-hero-slider .carousel-control-prev,
  .netflix-hero-slider .carousel-control-next {
    width: 5%;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .netflix-hero-slider:hover .carousel-control-prev,
  .netflix-hero-slider:hover .carousel-control-next {
    opacity: 1;
  }
  .netflix-hero-slider .carousel-indicators {
    bottom: 10px;
    z-index: 15;
  }
  body.ish-home-modern.ish-modern-light .netflix-hero-slider,
  body.ish-home-modern.ish-modern-light .netflix-hero-image-wrapper {
    background-color: #e7dcc9;
  }
  body.ish-home-modern.ish-modern-light .netflix-hero-vignette-bottom {
    background: linear-gradient(to top, #e7dcc9 0%, rgba(231, 220, 201, 0) 100%);
  }
  body.ish-home-modern.ish-modern-light .netflix-hero-vignette-left {
    background: linear-gradient(to right, rgba(156, 137, 108, 0.42) 0%, rgba(231, 220, 201, 0) 100%);
  }
  @media (max-width: 992px) {
    .netflix-hero-title { font-size: 2.5rem; }
    .netflix-hero-caption { right: 15%; bottom: 8%; }
  }
  @media (max-width: 768px) {
    .netflix-hero-caption { right: 5%; bottom: 40px; left: 5%; }
    .netflix-hero-title { font-size: 1.8rem; }
    .netflix-hero-image-wrapper { height: clamp(260px, 58vw, 380px); min-height: 0; }
    .netflix-hero-image { max-width: 92%; max-height: 62%; margin: 0 auto; }
    .netflix-hero-vignette-left { width: 100%; background: linear-gradient(to top, rgba(20,20,20,0.95) 0%, transparent 100%); }
    body.ish-home-modern.ish-modern-light .netflix-hero-vignette-left { background: linear-gradient(to top, rgba(156, 137, 108, 0.46) 0%, rgba(231, 220, 201, 0) 100%); }
    .netflix-hero-vignette-bottom { height: 70%; }
    .netflix-btn-play, .netflix-btn-more { padding: 8px 20px; font-size: 1rem; }
  }

  /* Netflix Row Carousel Styles */
  .netflix-row-container {
    position: relative;
  }
  .netflix-row-btn {
    position: absolute;
    top: 40%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    color: #000;
    border: none;
    z-index: 10;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  .netflix-row-container:hover .netflix-row-btn {
    opacity: 1;
  }
  .netflix-row-btn:hover {
    background: #fff;
    transform: translateY(-50%) scale(1.1);
  }
  .netflix-row-prev {
    left: 10px;
  }
  .netflix-row-next {
    right: 10px;
  }
  .ish-hm-row__track {
    scroll-behavior: smooth;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .ish-hm-row__track::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
</style>

@if(!empty($banner) && count($banner) > 0)
  <div id="netflixHeroCarousel" class="carousel slide netflix-hero-slider" data-ride="carousel" data-interval="5000">
    <ol class="carousel-indicators">
      @foreach($banner as $idx => $b)
        <li data-target="#netflixHeroCarousel" data-slide-to="{{ $idx }}" class="{{ $idx === 0 ? 'active' : '' }}"></li>
      @endforeach
    </ol>
    <div class="carousel-inner">
      @foreach($banner as $idx => $b)
        @php
          $heroImageUrl = \App\Support\FrontendMedia::heroImageUrl($b->cover_img ?? null, $b->youtube_url ?? null);
          $heroFallbackUrl = \App\Support\FrontendMedia::heroImageFallbackUrl($b->youtube_url ?? null);
          $heroMissingImage = \Illuminate\Support\Str::endsWith(parse_url($heroImageUrl, PHP_URL_PATH) ?: '', '/no_img.png');
          $videoUrl = url('/videos/'.($b->categorycode ?? '').'/'.($b->permalink ?? ''));
        @endphp
        <div class="carousel-item {{ $idx === 0 ? 'active' : '' }}">
          <div class="netflix-hero-image-wrapper">
            <img src="{{ $heroImageUrl }}" data-fallback-src="{{ $heroFallbackUrl }}" alt="{{ $b->title ?? '' }}" class="d-block w-100 netflix-hero-image">
            <div class="netflix-hero-vignette-bottom"></div>
            <div class="netflix-hero-vignette-left"></div>
          </div>
          <div class="carousel-caption netflix-hero-caption d-flex flex-column justify-content-end align-items-start text-left">
            <a class="netflix-hero-category" style="{{ $modernBadgeStyle($b) }}" href="{{ url('/category/'.($b->categorycode ?? '').'/'.($b->subcategorycode ?? '')) }}">
              {{ $b->subcategoryname ?? $b->categoryname ?? '' }}
            </a>
            <h1 class="netflix-hero-title" style="color: #ffffff !important;">
              {{ $b->title ?? '' }}
            </h1>
            <div class="netflix-hero-buttons mt-2 d-flex flex-wrap">
              <a href="{{ $videoUrl }}" class="btn btn-light netflix-btn-play mr-3 mb-2">
                <i class="fa fa-play mr-2"></i> Play
              </a>
              <a href="{{ $videoUrl }}" class="btn btn-secondary netflix-btn-more mb-2">
                <i class="fa fa-info-circle mr-2"></i> More Info
              </a>
            </div>
          </div>
        </div>
      @endforeach
    </div>
    <a class="carousel-control-prev" href="#netflixHeroCarousel" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#netflixHeroCarousel" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>
@endif

<section class="ish-hm-search">
  <div class="container">
    <form name="frmSearchModern" id="frmSearchModern" class="ish-hm-search__form" role="search" method="get" action="{{ url('/search') }}">
      <input id="sKeywordHomeModern" name="sKeyword" type="search" placeholder="Search stories…" aria-label="Search">
      <button type="submit"><i class="fa fa-search"></i></button>
    </form>
  </div>
</section>

@if($bn && ! empty($bn['news_list']) && count($bn['news_list']) > 0)
  <section class="ish-hm-row" aria-label="{{ $bn['title'] ?? 'Top stories' }}">
    <div class="container-fluid">
      <div class="ish-hm-row__head">
        <h2 class="ish-hm-row__title">{{ $bn['title'] ?? 'Top stories' }}</h2>
        <a class="ish-hm-row__more" href="{{ url('/category/'.($bn['code'] ?? '')) }}">View all</a>
      </div>
      <div class="netflix-row-container">
        <button class="netflix-row-btn netflix-row-prev"><i class="fa fa-chevron-left"></i></button>
        <button class="netflix-row-btn netflix-row-next"><i class="fa fa-chevron-right"></i></button>
        <div class="ish-hm-row__track">
          @foreach($bn['news_list'] as $slider)
            <article class="ish-hm-row-card">
              <a class="ish-hm-row-card__media" href="{{ url('/videos/'.($slider->categorycode ?? '').'/'.($slider->permalink ?? '')) }}" data-youtube-url="{{ $slider->youtube_url ?? '' }}" data-youtube-video="{{ $slider->youtube_video ?? '' }}" data-youtube-check="{{ $slider->youtube_url_check ?? 0 }}" data-title="{{ $slider->title ?? '' }}" data-href="{{ url('/videos/'.($slider->categorycode ?? '').'/'.($slider->permalink ?? '')) }}" data-img="{{ \App\Support\FrontendMedia::coverImageUrl($slider->cover_img ?? null, $slider->youtube_url ?? null) }}" data-category="{{ $slider->subcategoryname ?? '' }}">
                <img src="{{ \App\Support\FrontendMedia::coverImageUrl($slider->cover_img ?? null, $slider->youtube_url ?? null) }}" alt="" loading="lazy">
                <span class="ish-hm-row-card__overlay" aria-hidden="true"></span>
                <span class="ish-hm-row-card__cat" style="{{ $modernBadgeStyle($slider) }}">{{ $slider->subcategoryname ?? '' }}</span>
              </a>
              <div class="ish-hm-row-card__body">
                <h3 class="ish-hm-row-card__title"><a href="{{ url('/videos/'.($slider->categorycode ?? '').'/'.($slider->permalink ?? '')) }}">{{ $slider->title ?? '' }}</a></h3>
              </div>
            </article>
          @endforeach
        </div>
      </div>
    </div>
  </section>
@endif

@foreach([2, 3, 4, 5] as $slot)
  @php $TCatData = ($CategorySet1 ?? [])[$slot] ?? null; @endphp
  @if(!$TCatData || empty($TCatData['news_list']) || count($TCatData['news_list']) === 0)
    @continue
  @endif
  <section class="ish-hm-row" aria-label="{{ $TCatData['title'] ?? 'Category' }}">
    <div class="container-fluid">
      <div class="ish-hm-row__head">
        <h2 class="ish-hm-row__title">{{ $TCatData['title'] ?? '' }}</h2>
        <a class="ish-hm-row__more" href="{{ url('/category/'.($TCatData['code'] ?? '')) }}">View all</a>
      </div>
      <div class="netflix-row-container">
        <button class="netflix-row-btn netflix-row-prev"><i class="fa fa-chevron-left"></i></button>
        <button class="netflix-row-btn netflix-row-next"><i class="fa fa-chevron-right"></i></button>
        <div class="ish-hm-row__track">
          @foreach($TCatData['news_list'] as $item)
            <article class="ish-hm-row-card">
              <a class="ish-hm-row-card__media" href="{{ url('/videos/'.($item->categorycode ?? '').'/'.($item->permalink ?? '')) }}" data-youtube-url="{{ $item->youtube_url ?? '' }}" data-youtube-video="{{ $item->youtube_video ?? '' }}" data-youtube-check="{{ $item->youtube_url_check ?? 0 }}" data-title="{{ $item->title ?? '' }}" data-href="{{ url('/videos/'.($item->categorycode ?? '').'/'.($item->permalink ?? '')) }}" data-img="{{ \App\Support\FrontendMedia::coverImageUrl($item->cover_img ?? null, $item->youtube_url ?? null) }}" data-category="{{ $item->subcategoryname ?? '' }}">
                <img src="{{ \App\Support\FrontendMedia::coverImageUrl($item->cover_img ?? null, $item->youtube_url ?? null) }}" alt="" loading="lazy">
                <span class="ish-hm-row-card__overlay" aria-hidden="true"></span>
                <span class="ish-hm-row-card__cat" style="{{ $modernBadgeStyle($item) }}">{{ $item->subcategoryname ?? '' }}</span>
              </a>
              <div class="ish-hm-row-card__body">
                <h3 class="ish-hm-row-card__title"><a href="{{ url('/videos/'.($item->categorycode ?? '').'/'.($item->permalink ?? '')) }}">{{ $item->title ?? '' }}</a></h3>
              </div>
            </article>
          @endforeach
        </div>
      </div>
    </div>
  </section>
@endforeach

<section class="ish-hm-aside-wrap ish-hm-aside-wrap--modern-hidden">
  <div class="container">
    <div class="row">
      <div class="col-lg-12">
        <div class="ish-hm-sidebar">
          @include('frontend.sidebar_shop')
          @include('frontend.sidebar_ads')
          @include('frontend.sidebar_sm')
        </div>
      </div>
    </div>
  </div>
</section>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    const containers = document.querySelectorAll('.netflix-row-container');
    containers.forEach(container => {
      const track = container.querySelector('.ish-hm-row__track');
      const btnPrev = container.querySelector('.netflix-row-prev');
      const btnNext = container.querySelector('.netflix-row-next');

      if (btnPrev && btnNext && track) {
        btnPrev.addEventListener('click', () => {
          // scroll left by 80% of track's visible width
          track.scrollBy({ left: -(track.clientWidth * 0.8), behavior: 'smooth' });
        });
        
        btnNext.addEventListener('click', () => {
          // scroll right by 80% of track's visible width
          track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' });
        });
      }
    });
  });
</script>

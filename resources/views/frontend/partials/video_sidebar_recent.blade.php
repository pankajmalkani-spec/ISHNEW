@php
  $isModern = ($frontendTheme ?? 'legacy') === 'modern';
  $recentBadgeStyle = static function ($item): string {
      $color = trim((string) (($item->subcategorycolor ?? null) ?: ($item->categorycolor ?? null) ?: '#232323'));
      if (! preg_match('/^#(?:[0-9a-fA-F]{3}){1,2}$/', $color)) {
          $color = '#232323';
      }

      $hex = ltrim($color, '#');
      if (strlen($hex) === 3) {
          $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
      }

      $brightness = ((hexdec(substr($hex, 0, 2)) * 299) + (hexdec(substr($hex, 2, 2)) * 587) + (hexdec(substr($hex, 4, 2)) * 114)) / 1000;

      return 'background-color: '.$color.' !important; color: '.($brightness > 170 ? '#111111' : '#ffffff').' !important;';
  };
@endphp
<div class="sidebar theiaStickySidebar">
  <div class="title-section sidebar-title">
    <h1>Recent News</h1>
  </div>
  <div class="row">
    @foreach($recentNews as $recent)
      <div class="col-lg-12 col-md-6">
        @if($isModern)
          <article class="ish-hm-row-card ish-cat-modern-card" style="flex: none; min-width: 0; max-width: none; width: 100%; margin-bottom: 24px;">
            <a class="ish-hm-row-card__media" href="{{ url('/videos/'.($recent->categorycode ?? '').'/'.($recent->permalink ?? '')) }}" data-youtube-url="{{ $recent->youtube_url ?? '' }}" data-youtube-video="{{ $recent->youtube_video ?? '' }}" data-youtube-check="{{ $recent->youtube_url_check ?? 0 }}" data-title="{{ $recent->title ?? '' }}" data-href="{{ url('/videos/'.($recent->categorycode ?? '').'/'.($recent->permalink ?? '')) }}" data-img="{{ \App\Support\FrontendMedia::coverImageUrl($recent->cover_img ?? null, $recent->youtube_url ?? null) }}" data-category="{{ $recent->subcategoryname ?? '' }}">
              <img src="{{ \App\Support\FrontendMedia::coverImageUrl($recent->cover_img ?? null, $recent->youtube_url ?? null) }}" alt="" loading="lazy">
              <span class="ish-hm-row-card__overlay" aria-hidden="true"></span>
              <span class="ish-hm-row-card__cat" style="{{ $recentBadgeStyle($recent) }}">{{ $recent->subcategoryname ?? '' }}</span>
            </a>
            <div class="ish-hm-row-card__body">
              <h3 class="ish-hm-row-card__title"><a href="{{ url('/videos/'.($recent->categorycode ?? '').'/'.($recent->permalink ?? '')) }}">{{ $recent->title ?? '' }}</a></h3>
            </div>
          </article>
        @else
          <div class="news-post standart-post">
            <div class="post-image">
              <a href="{{ url('/videos/'.($recent->categorycode ?? '').'/'.($recent->permalink ?? '')) }}">
                <img src="{{ \App\Support\FrontendMedia::coverImageUrl($recent->cover_img ?? null, $recent->youtube_url ?? null) }}" alt="{{ $recent->title ?? '' }}" loading="lazy">
              </a>
              <a href="{{ url('/category/'.($recent->categorycode ?? '').'/'.($recent->subcategorycode ?? '')) }}" class="category category-{{ $recent->categorycode ?? '' }}" style="{{ $recentBadgeStyle($recent) }}">{{ $recent->subcategoryname ?? '' }}</a>
            </div>
            <h2><a href="{{ url('/videos/'.($recent->categorycode ?? '').'/'.($recent->permalink ?? '')) }}">{{ $recent->title ?? '' }}</a></h2>
          </div>
        @endif
      </div>
    @endforeach
  </div>
</div>

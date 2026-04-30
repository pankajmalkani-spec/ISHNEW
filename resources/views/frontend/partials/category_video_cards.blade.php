@php
  $isModern = ($frontendTheme ?? 'legacy') === 'modern';
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

@if($isModern)
<style>
  .ish-cat-modern-card.ish-hm-row-card {
    flex: none;
    min-width: 0;
    max-width: none;
    width: 100%;
    margin-bottom: 24px;
  }
</style>
@endif

@foreach($videos as $video)
  <div class="col-lg-3 col-md-4 col-sm-6">
    @if($isModern)
      <article class="ish-hm-row-card ish-cat-modern-card">
        <a class="ish-hm-row-card__media" href="{{ url('/videos/'.($video->categorycode ?? '').'/'.($video->permalink ?? '')) }}" data-youtube-url="{{ $video->youtube_url ?? '' }}" data-youtube-video="{{ $video->youtube_video ?? '' }}" data-youtube-check="{{ $video->youtube_url_check ?? 0 }}" data-title="{{ $video->title ?? '' }}" data-href="{{ url('/videos/'.($video->categorycode ?? '').'/'.($video->permalink ?? '')) }}" data-img="{{ \App\Support\FrontendMedia::coverImageUrl($video->cover_img ?? null, $video->youtube_url ?? null) }}" data-category="{{ $video->subcategoryname ?? '' }}">
          <img src="{{ \App\Support\FrontendMedia::coverImageUrl($video->cover_img ?? null, $video->youtube_url ?? null) }}" alt="" loading="lazy">
          <span class="ish-hm-row-card__overlay" aria-hidden="true"></span>
        </a>
        <div class="ish-hm-row-card__body">
          <span class="ish-hm-row-card__cat" style="{{ $modernBadgeStyle($video) }}">{{ $video->subcategoryname ?? '' }}</span>
          <h3 class="ish-hm-row-card__title"><a href="{{ url('/videos/'.($video->categorycode ?? '').'/'.($video->permalink ?? '')) }}">{{ $video->title ?? '' }}</a></h3>
        </div>
      </article>
    @else
      <div class="news-post standart-post">
        <div class="post-image">
          <a href="{{ url('/videos/'.($video->categorycode ?? '').'/'.($video->permalink ?? '')) }}">
            <img src="{{ \App\Support\FrontendMedia::coverImageUrl($video->cover_img ?? null, $video->youtube_url ?? null) }}" alt="{{ $video->title ?? '' }}" loading="lazy">
          </a>
          <a href="{{ url('/category/'.($video->categorycode ?? '').'/'.($video->subcategorycode ?? '')) }}" class="category category-{{ $video->categorycode ?? '' }}">{{ $video->subcategoryname ?? '' }}</a>
        </div>
        <h2><a href="{{ url('/videos/'.($video->categorycode ?? '').'/'.($video->permalink ?? '')) }}">{{ $video->title ?? '' }}</a></h2>
        <ul class="post-tags">
          <li><i class="fa fa-calendar"></i><a href="#">@if(! empty($video->schedule_date)){{ \Illuminate\Support\Carbon::parse($video->schedule_date)->format('M j, Y') }}@endif</a></li>
          <li><i class="fa fa-newspaper-o"></i><a href="#">{{ $video->newsourcename ?? '' }}</a></li>
        </ul>
        <p>{{ \Illuminate\Support\Str::limit(strip_tags((string) ($video->description ?? '')), 220) }}</p>
      </div>
    @endif
  </div>
@endforeach

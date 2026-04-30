<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
  <meta http-equiv="Cache-control" content="public">
  <title>Search | ISH News</title>
  @include('frontend.inc_htmlhead')
</head>
<body @class([
  'ish-theme',
  'ish-theme-'.($frontendTheme ?? 'legacy'),
  'ish-search-page',
  'ish-home-modern' => ($frontendTheme ?? 'legacy') === 'modern',
  'ish-modern-'.($frontendModernScheme ?? 'dark') => ($frontendTheme ?? 'legacy') === 'modern',
])>
<div id="container">
  <header class="clearfix">
    @include('frontend.inc_header')
    @include('frontend.inc_navbar')
  </header>

  <section id="content-section">
    <div class="container">
      <div class="search-results-box">
        <div class="search-results-banner">
          <h1>Search results for <span>'{{ $keyword }}'</span></h1>
          <h3>Found <b>{{ count($results ?? []) }}</b> results for your search.</h3>
        </div>
        <div class="search-box">
          <form name="frmSearch" id="frmSearch" role="search" class="search-form" method="get" action="{{ url('/search') }}">
            <input id="sKeyword" name="sKeyword" class="form-control mr-sm-2" type="search" placeholder="Search here" aria-label="Search" value="{{ $keyword }}">
            <button id="search" name="search" class="btn btn-primary my-2 my-sm-0" type="submit"><i class="fa fa-search"></i></button>
          </form>
        </div>
      </div>

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

      <div class="row">
        <div class="{{ $isModern ? 'col-12' : 'col-lg-9' }}">
          <div class="posts-block articles-box">
            <div class="row" id="js-search-video-grid">
              @if(count($results) > 0)
                @include('frontend.partials.search_video_cards', ['videos' => $results])
              @else
                <div class="col-12">
                  <div class="alert-warning" style="padding:20px; border-radius:8px;">
                    <h3 class="entry-title text-center mb-0">No Data Found</h3>
                  </div>
                </div>
              @endif
            </div>

            @if(! empty($hasMore))
              <div id="search-loader" class="text-center" style="display:none; margin-top: 1.5rem;">
                <i class="fa fa-spinner fa-spin" aria-hidden="true"></i> <span>Loading…</span>
              </div>
              <div id="search-load-sentinel" style="height:1px; margin-top: 1rem;" aria-hidden="true"></div>
            @endif
          </div>
        </div>
        <div class="{{ $isModern ? 'col-12 sidebar-sticky' : 'col-lg-3 sidebar-sticky' }}">
          <div class="sidebar theiaStickySidebar">
            @include('frontend.sidebar_sm')
          </div>
        </div>
      </div>
    </div>
  </section>

  @include('frontend.inc_carousel_slider')
  @include('frontend.inc_footerbottom')
</div>
@include('frontend.inc_footerscript')
<script>
$(document).ready(function () {
  $('#frmSearch').validate({
    rules: { sKeyword: { required: true } },
    messages: { sKeyword: 'Please enter the text to search.' },
    submitHandler: function (form) { form.submit(); }
  });
});

@if(! empty($hasMore))
(function () {
  var grid = document.getElementById('js-search-video-grid');
  var sentinel = document.getElementById('search-load-sentinel');
  var loader = document.getElementById('search-loader');
  if (!grid || !sentinel) return;

  var nextPage = {{ (int) ($nextPage ?? 2) }};
  var loading = false;
  var keyword = @json($keyword ?? '');

  function appendHtml(html) {
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    while (wrap.firstChild) {
      grid.appendChild(wrap.firstChild);
    }
  }

  var obs = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting || loading || !nextPage) return;
    loading = true;
    if (loader) loader.style.display = 'block';

    var url = new URL(window.location.origin + '/search');
    url.searchParams.set('page', String(nextPage));
    if (keyword) url.searchParams.set('sKeyword', keyword);

    fetch(url.toString(), {
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
      credentials: 'same-origin'
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.html) appendHtml(data.html);
        nextPage = data.has_more ? data.next_page : null;
        if (!data.has_more) obs.disconnect();
      })
      .catch(function () { obs.disconnect(); })
      .finally(function () {
        loading = false;
        if (loader) loader.style.display = 'none';
      });
  }, { rootMargin: '240px' });

  obs.observe(sentinel);
})();
@endif
</script>
</body>
</html>

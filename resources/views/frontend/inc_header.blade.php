<?php $Base_url = url('/').'/'; ?>
@php
  $ft = $frontendTheme ?? 'legacy';
  $modernScheme = $frontendModernScheme ?? 'dark';
@endphp
<div class="top-line">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-md-5 col-sm-12 mb-2 mb-md-0">
        <ul class="info-list">
          <li><a href="{{ url('/about') }}" title="About Us">About</a></li>
          <li><a href="{{ url('/contact') }}" title="Contact Us">Contact</a></li>
          <li><a href="{{ url('/sitemap') }}" title="Sitemap"><i class="fa fa-sitemap" aria-hidden="true"></i></a></li>
          <li><a href="https://indiasigninghands.com/shop/" title="Shop With Us" target="_blank"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a></li>
        </ul>
      </div>
      @if(config('ish.theme_toggle_enabled'))
      <div class="col-md-4 col-sm-12 mb-2 mb-md-0 text-md-center">
        @php
          $toggleToModern = route('theme.set', ['theme' => 'modern']);
          $toggleToLegacy = route('theme.set', ['theme' => 'legacy']);
          $toggleHref = $ft === 'modern' ? $toggleToLegacy : $toggleToModern;
        @endphp
        <div class="ish-theme-toggle-bar">
          <div class="ish-theme-toggle-wrap {{ $ft === 'modern' ? 'ish-theme-toggle-wrap--modern' : 'ish-theme-toggle-wrap--legacy' }}">
            <span class="ish-theme-toggle__text ish-theme-toggle__text--legacy">Legacy</span>
            <button type="button"
              class="ish-theme-toggle"
              role="switch"
              aria-checked="{{ $ft === 'modern' ? 'true' : 'false' }}"
              aria-label="Switch site appearance. Currently {{ $ft === 'modern' ? 'Modern' : 'Legacy' }}. Click to use {{ $ft === 'modern' ? 'Legacy' : 'Modern' }}."
              onclick="window.location.href='{{ $toggleHref }}'">
              <span class="ish-theme-toggle__track" aria-hidden="true">
                <span class="ish-theme-toggle__thumb"></span>
              </span>
            </button>
            <span class="ish-theme-toggle__text ish-theme-toggle__text--modern">Modern</span>
          </div>
          @if($ft === 'modern')
            @php
              $toggleToLight = route('theme.modern-scheme.set', ['scheme' => 'light']);
              $toggleToDark = route('theme.modern-scheme.set', ['scheme' => 'dark']);
              $schemeHref = $modernScheme === 'dark' ? $toggleToLight : $toggleToDark;
            @endphp
            <span class="ish-theme-toggle-separator" aria-hidden="true"></span>
            <div class="ish-theme-toggle-wrap ish-modern-scheme-toggle-wrap {{ $modernScheme === 'dark' ? 'ish-theme-toggle-wrap--modern' : 'ish-theme-toggle-wrap--legacy' }}">
              <span class="ish-theme-toggle__text ish-theme-toggle__text--legacy">Light</span>
              <button type="button"
                class="ish-theme-toggle ish-modern-scheme-toggle"
                role="switch"
                aria-checked="{{ $modernScheme === 'dark' ? 'true' : 'false' }}"
                aria-label="Switch Modern color mode. Currently {{ $modernScheme === 'dark' ? 'Dark' : 'Light' }}. Click to use {{ $modernScheme === 'dark' ? 'Light' : 'Dark' }}."
                onclick="window.location.href='{{ $schemeHref }}'">
                <span class="ish-theme-toggle__track" aria-hidden="true">
                  <span class="ish-theme-toggle__thumb"></span>
                </span>
              </button>
              <span class="ish-theme-toggle__text ish-theme-toggle__text--modern">Dark</span>
            </div>
          @endif
        </div>
      </div>
      @endif
      <div class="col-md-{{ config('ish.theme_toggle_enabled') ? '3' : '7' }} col-sm-12 text-md-right">
        <ul class="social-icons">
          <li><a class="youtube" href="https://www.youtube.com/ishnews" target="_blank"><i class="fa fa-youtube-play"></i></a></li>
          <li><a class="facebook" href="https://www.facebook.com/ISHNews/" target="_blank"><i class="fa fa-facebook"></i></a></li>
          <li><a class="instagram" href="https://www.instagram.com/ishnews/" target="_blank"><i class="fa fa-instagram"></i></a></li>
          <li><a class="twitter" href="https://twitter.com/ishnews_tv" target="_blank"><i class="fa fa-twitter"></i></a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
<div id="header-banner" class="header-banner-place">
  <div class="container">
    <div class="row">
      <div class="col-sm-5">
        <div class="header-tagline">Information Beyond Words</div>
      </div>
      <div class="col-sm-2">
        <div class="header-logo"><a class="navbar-brand" href="{{ url('/') }}"><img class="logo" src="{{ url('/images/ish-news-logo.png') }}" alt="Logo of ISH News"></a></div>
      </div>
    </div>
  </div>
</div>

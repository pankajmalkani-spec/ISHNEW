{{-- Modern home only: dark cinematic nav + mega panels (same $menu data as legacy) --}}
<nav class="ish-nav-modern" id="ish-nav-modern" aria-label="Main">
  <div class="ish-nav-modern__bar">
    <div class="container-fluid ish-nav-modern__bar-inner">
      <div class="ish-nav-modern__start">
        <a class="ish-nav-modern__brand" href="{{ url('/') }}">
          <img src="{{ url('/images/ish-news-logo.png') }}" alt="ISH News" class="ish-nav-modern__logo" width="120" height="40" loading="eager">
        </a>
        <button type="button" class="ish-nav-modern__burger" id="ish-nav-modern-burger" aria-expanded="false" aria-controls="ish-nav-modern-panel" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <div class="ish-nav-modern__center">
        <div class="ish-nav-modern__panel" id="ish-nav-modern-panel">
          <ul class="ish-nav-modern__list">
            <li class="ish-nav-modern__item">
              <a class="ish-nav-modern__link ish-nav-modern__link--home" href="{{ url('/') }}">Home</a>
            </li>
            @foreach(($menu ?? []) as $cat)
              <li class="ish-nav-modern__item ish-nav-modern__item--mega">
                <button type="button" class="ish-nav-modern__link ish-nav-modern__link--mega-trigger" aria-expanded="false" aria-controls="ish-mega-{{ $loop->index }}" aria-haspopup="true">
                  {{ $cat['title'] ?? '' }}
                  <span class="ish-nav-modern__chev" aria-hidden="true"></span>
                </button>
                <div class="ish-nav-mega" id="ish-mega-{{ $loop->index }}" role="region" aria-label="{{ $cat['title'] ?? 'Category' }}">
                  <div class="ish-nav-mega__inner container">
                    @if(!empty($cat['subcategories']) && count($cat['subcategories']) > 0)
                      <div class="ish-nav-mega__filters">
                        <a class="ish-nav-mega__pill ish-nav-mega__pill--active" href="{{ url('/category/'.($cat['code'] ?? '')) }}">All</a>
                        @foreach($cat['subcategories'] as $sub)
                          @php
                            $subColor = trim((string) ($sub->color ?? ''));
                            $subColorStyle = preg_match('/^#(?:[0-9a-fA-F]{3}){1,2}$/', $subColor) ? '--ish-subcat-color: '.$subColor.';' : '';
                          @endphp
                          <a class="ish-nav-mega__pill" style="{{ $subColorStyle }}" href="{{ url('/category/'.($cat['code'] ?? '').'/'.($sub->code ?? '')) }}">{{ $sub->name ?? '' }}</a>
                        @endforeach
                      </div>
                    @endif
                    @if(!empty($cat['latest']))
                      <div class="row ish-nav-mega__grid">
                        @foreach(collect($cat['latest'])->take(4) as $item)
                          <div class="col-6 col-md-3">
                            <article class="ish-nav-mega__card">
                              <a class="ish-nav-mega__thumb" href="{{ url('/videos/'.($item->categorycode ?? '').'/'.($item->permalink ?? '')) }}" data-youtube-url="{{ $item->youtube_url ?? '' }}" data-youtube-video="{{ $item->youtube_video ?? '' }}" data-youtube-check="{{ $item->youtube_url_check ?? 0 }}" data-title="{{ $item->content_title ?? '' }}" data-href="{{ url('/videos/'.($item->categorycode ?? '').'/'.($item->permalink ?? '')) }}" data-img="{{ \App\Support\FrontendMedia::coverImageUrl($item->cover_img ?? null, $item->youtube_url ?? null) }}" data-category="{{ $item->subcatname ?? '' }}">
                                <img src="{{ \App\Support\FrontendMedia::coverImageUrl($item->cover_img ?? null, $item->youtube_url ?? null) }}" alt="" loading="lazy">
                                <a class="category category-{{ $item->categorycode ?? '' }}" href="{{ url('/category/'.($item->categorycode ?? '')) }}">{{ \Str::upper(str_replace('_', ' ', $item->categorycode ?? '')) }}</a>
                              </a>
                              <a class="ish-nav-mega__card-title" href="{{ url('/videos/'.($item->categorycode ?? '').'/'.($item->permalink ?? '')) }}">{{ $item->content_title ?? '' }}</a>
                              @if(! empty($item->schedule_date))
                                <div class="ish-nav-mega__card-meta">
                                  <span><i class="fa fa-calendar"></i>{{ \Illuminate\Support\Carbon::parse($item->schedule_date)->format('M j, Y') }}</span>
                                </div>
                              @endif
                            </article>
                          </div>
                        @endforeach
                      </div>
                    @else
                      <p class="ish-nav-mega__empty">Browse <a href="{{ url('/category/'.($cat['code'] ?? '')) }}">{{ $cat['title'] ?? 'category' }}</a>.</p>
                    @endif
                  </div>
                </div>
              </li>
            @endforeach
          </ul>
        </div>
      </div>

      <div class="ish-nav-modern__actions">
        <form name="frmNavSearchModern" class="ish-nav-modern__search ish-nav-modern__search--nav" role="search" method="get" action="{{ url('/search') }}">
          <input name="sKeyword" type="search" placeholder="Search…" aria-label="Search" autocomplete="off">
          <button type="submit" aria-label="Submit search"><i class="fa fa-search"></i></button>
        </form>
      </div>
    </div>
  </div>
  <div class="ish-nav-modern__backdrop" id="ish-nav-modern-backdrop" hidden aria-hidden="true"></div>
</nav>

<script>
(function () {
  var nav = document.getElementById('ish-nav-modern');
  var burger = document.getElementById('ish-nav-modern-burger');
  var panel = document.getElementById('ish-nav-modern-panel');
  var backdrop = document.getElementById('ish-nav-modern-backdrop');
  if (!nav || !burger || !panel) return;

  function setOpen(open) {
    nav.classList.toggle('ish-nav-modern--open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    document.body.classList.toggle('ish-nav-modern--lock', open);
  }

  burger.addEventListener('click', function () {
    setOpen(!nav.classList.contains('ish-nav-modern--open'));
  });

  if (backdrop) {
    backdrop.addEventListener('click', function () { setOpen(false); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setOpen(false);
    nav.querySelectorAll('.ish-nav-modern__item--mega-open').forEach(function (el) {
      el.classList.remove('ish-nav-modern__item--mega-open');
      var bt = el.querySelector('.ish-nav-modern__link--mega-trigger');
      if (bt) bt.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu when following in-panel link
  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.matchMedia('(max-width: 991px)').matches) setOpen(false);
    });
  });

  // Ensure menu resets correctly when resizing from mobile-open to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992 && nav.classList.contains('ish-nav-modern--open')) {
      setOpen(false);
    }
  });

  // Desktop (lg+): category label is a <button> — toggles mega (no navigation from label; use “All” / pills / cards).
  function closeMegaItem(item) {
    if (!item) return;
    item.classList.remove('ish-nav-modern__item--mega-open');
    var btn = item.querySelector('.ish-nav-modern__link--mega-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function closeAllMegaItems() {
    nav.querySelectorAll('.ish-nav-modern__item--mega-open').forEach(closeMegaItem);
  }

  function openMegaItem(item) {
    if (!item || !item.querySelector('.ish-nav-mega')) return;
    closeAllMegaItems();
    item.classList.add('ish-nav-modern__item--mega-open');
    var btn = item.querySelector('.ish-nav-modern__link--mega-trigger');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  nav.querySelectorAll('.ish-nav-modern__link--mega-trigger').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var li = btn.closest('.ish-nav-modern__item--mega');
      if (!li || !li.querySelector('.ish-nav-mega')) return;

      var isMobile = !window.matchMedia('(min-width: 992px)').matches;
      var opening = !li.classList.contains('ish-nav-modern__item--mega-open');

      // Close all others
      nav.querySelectorAll('.ish-nav-modern__item--mega-open').forEach(function (el) {
        if (el !== li) {
          el.classList.remove('ish-nav-modern__item--mega-open');
          var b = el.querySelector('.ish-nav-modern__link--mega-trigger');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });

      if (opening) {
        li.classList.add('ish-nav-modern__item--mega-open');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        li.classList.remove('ish-nav-modern__item--mega-open');
        btn.setAttribute('aria-expanded', 'false');
      }

      // On mobile, we want to prevent default if it's a toggle
      if (isMobile) {
        e.preventDefault();
      }
    });
  });

  nav.querySelectorAll('.ish-nav-modern__item--mega').forEach(function (item) {
    var closeTimer = null;

    item.addEventListener('mouseenter', function () {
      if (!window.matchMedia('(min-width: 992px)').matches) return;
      clearTimeout(closeTimer);
      openMegaItem(item);
    });

    item.addEventListener('mouseleave', function () {
      if (!window.matchMedia('(min-width: 992px)').matches) return;
      closeTimer = setTimeout(function () {
        if (document.body.classList.contains('netflix-popout-active')) return;
        closeMegaItem(item);
      }, 150);
    });
  });

  document.addEventListener('click', function (e) {
    if (!window.matchMedia('(min-width: 992px)').matches) return;
    if (nav.contains(e.target)) return;
    nav.querySelectorAll('.ish-nav-modern__item--mega-open').forEach(function (el) {
      el.classList.remove('ish-nav-modern__item--mega-open');
      var b = el.querySelector('.ish-nav-modern__link--mega-trigger');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });
})();
</script>
<script>
$(document).ready(function () {
  $('form[name="frmNavSearchModern"]').validate({
    rules: { sKeyword: { required: true } },
    messages: { sKeyword: 'Please enter the text to search.' },
    submitHandler: function (form) { form.submit(); }
  });

  // Keep navbar search reliable even when validation plugin is delayed/blocked.
  $('form[name="frmNavSearchModern"]').on('submit', function (e) {
    var $form = $(this);
    var $input = $form.find('input[name="sKeyword"]');
    var keyword = ($input.val() || '').trim();
    if (keyword === '') {
      e.preventDefault();
      if ($input.length) $input.focus();
      return false;
    }
    e.preventDefault();
    window.location.href = "{{ url('/search') }}" + '?sKeyword=' + encodeURIComponent(keyword);
    return false;
  });
});
</script>
<style>
/* Reset previous scale on cards */
.ish-hm-strip__cell, .ish-hm-row-card, .ish-nav-mega__thumb {
  position: relative;
  z-index: 1;
}

/* Netflix Popout Container */
.netflix-popout-wrapper {
  position: fixed;
  z-index: 10005;
  background: #141414;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  pointer-events: none; /* until fully active */
  display: flex;
  flex-direction: column;
}

.netflix-popout-wrapper.active {
  opacity: 1;
  pointer-events: auto;
}

.netflix-popout-video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
}

.netflix-popout-video-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  transition: opacity 0.5s ease;
}

.netflix-popout-video-container iframe,
.netflix-popout-video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  border: none;
  pointer-events: none;
}

.netflix-popout-info {
  padding: 15px;
  color: #fff;
  font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.netflix-popout-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.netflix-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.5);
  background: rgba(42,42,42,0.6);
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
}

.netflix-btn:hover {
  border-color: white;
  background: rgba(255,255,255,0.2);
  color: white;
}

.netflix-btn.play {
  background: white;
  color: black;
  border-color: white;
}

.netflix-btn.play:hover {
  background: rgba(255,255,255,0.8);
}

.netflix-popout-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.netflix-popout-meta {
  font-size: 11px;
  color: #a3a3a3;
}
.netflix-popout-meta span {
  border: 1px solid #a3a3a3;
  padding: 1px 4px;
  border-radius: 3px;
  margin-right: 5px;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function () {
  const hoverDelay = 500; 
  let hoverTimer = null;
  let activePopout = null;
  let currentCard = null;

  function getYoutubeId(url) {
    if (!url) return null;
    var m = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (m && m[2] && m[2].length === 11) ? m[2] : null;
  }

  function createPopout(card) {
    const title = card.getAttribute('data-title') || '';
    const href = card.getAttribute('data-href') || '#';
    const imgSrc = card.getAttribute('data-img') || '';
    const category = card.getAttribute('data-category') || '';
    const youtubeUrl = card.getAttribute('data-youtube-url');
    const localVideo = card.getAttribute('data-youtube-video');
    const ytCheck = card.getAttribute('data-youtube-check') === '1';

    const rect = card.getBoundingClientRect();
    const scaleMultiplier = 1.35; 
    const popoutWidth = rect.width * scaleMultiplier;
    
    let top = rect.top - (rect.height * (scaleMultiplier - 1)) / 2;
    let left = rect.left - (rect.width * (scaleMultiplier - 1)) / 2;
    
    if (left < 20) left = 20;
    if (left + popoutWidth > window.innerWidth - 20) left = window.innerWidth - popoutWidth - 20;

    const wrapper = document.createElement('div');
    wrapper.className = 'netflix-popout-wrapper';
    wrapper.style.top = top + 'px';
    wrapper.style.left = left + 'px';
    wrapper.style.width = popoutWidth + 'px';
    wrapper.style.transform = `scale(${1 / scaleMultiplier})`;
    wrapper.style.transformOrigin = 'center center';

    let videoHtml = '';
    if (ytCheck && youtubeUrl) {
      let ytId = getYoutubeId(youtubeUrl);
      if (ytId) {
        videoHtml = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&showinfo=0&modestbranding=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    } else if (localVideo) {
      let safeFile = localVideo.replace(/\\/g, '/').split('/').pop();
      let src = '{{ url("videos") }}/' + safeFile;
      videoHtml = `<video src="${src}" autoplay muted loop playsinline></video>`;
    } else if (!ytCheck && youtubeUrl) {
      let ytId = getYoutubeId(youtubeUrl);
      if (ytId) {
        videoHtml = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&showinfo=0&modestbranding=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    }

    wrapper.innerHTML = `
      <div class="netflix-popout-video-container" onclick="window.location.href='${href}'" style="cursor:pointer;">
        <img src="${imgSrc}" alt="" />
        ${videoHtml}
      </div>
      <div class="netflix-popout-info">
        <div class="netflix-popout-buttons">
          <a href="${href}" class="netflix-btn play" title="Play"><i class="fa fa-play"></i></a>
          <a href="${href}" class="netflix-btn" title="More Info"><i class="fa fa-plus"></i></a>
          <a href="${href}" class="netflix-btn" title="Like"><i class="fa fa-thumbs-o-up"></i></a>
        </div>
        <h4 class="netflix-popout-title">${title}</h4>
        <div class="netflix-popout-meta">
          <span>HD</span> ${category}
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);
    document.body.classList.add('netflix-popout-active');
    
    requestAnimationFrame(() => {
      wrapper.style.transform = 'scale(1)';
      wrapper.classList.add('active');
    });

    const iframe = wrapper.querySelector('iframe');
    const video = wrapper.querySelector('video');
    const img = wrapper.querySelector('img');
    
    if (iframe) {
      iframe.onload = () => { setTimeout(() => { if(img) img.style.opacity = '0'; }, 500); };
    } else if (video) {
      video.onplaying = () => { if(img) img.style.opacity = '0'; };
    }

    wrapper.addEventListener('mouseleave', () => {
      removePopout();
    });

    activePopout = wrapper;
  }

  function removePopout() {
    if (activePopout) {
      document.body.classList.remove('netflix-popout-active');
      const el = activePopout;
      el.classList.remove('active');
      el.style.transform = 'scale(0.8)';
      el.style.opacity = '0';
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
      activePopout = null;
      
      if (currentCard) {
        var megaItem = currentCard.closest('.ish-nav-modern__item--mega');
        if (megaItem && !megaItem.matches(':hover')) {
          megaItem.classList.remove('ish-nav-modern__item--mega-open');
          var btn = megaItem.querySelector('.ish-nav-modern__link--mega-trigger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      }
      currentCard = null;
    }
  }

  document.body.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.ish-hm-row-card__media, .ish-hm-strip__cell, .ish-nav-mega__thumb');
    if (!card) return;
    if (!card.getAttribute('data-youtube-url') && !card.getAttribute('data-youtube-video')) return;

    if (e.relatedTarget && card.contains(e.relatedTarget)) return;

    if (hoverTimer) clearTimeout(hoverTimer);
    if (currentCard === card) return;
    
    hoverTimer = setTimeout(() => {
      if (activePopout) removePopout();
      currentCard = card;
      createPopout(card);
    }, hoverDelay);
  });

  document.body.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.ish-hm-row-card__media, .ish-hm-strip__cell, .ish-nav-mega__thumb');
    if (!card) return;
    if (!card.getAttribute('data-youtube-url') && !card.getAttribute('data-youtube-video')) return;

    if (e.relatedTarget && card.contains(e.relatedTarget)) return;

    if (hoverTimer) clearTimeout(hoverTimer);
    setTimeout(() => {
      if (activePopout && !activePopout.matches(':hover')) {
        removePopout();
      }
    }, 50);
  });
});
</script>

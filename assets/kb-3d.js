/* Kongu Brilliance — site-wide 3D layer
   - 3D scroll reveal for headings, cards, images
   - Mouse-follow 3D tilt + light glare on cards (desktop)
   - 3D parallax depth on the hero
   Uses the individual `rotate` / `translate` / `scale` CSS properties so it
   never overrides a page's own `transform` animations.  */
(function () {
  'use strict';
  if (window.__kb3d) return; window.__kb3d = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  var css = [
    '.kb3d-persp{perspective:1400px;}',
    '.kb3d-r{opacity:0;rotate:x 22deg;translate:0 46px -120px;transition:opacity .9s cubic-bezier(.2,.7,.2,1),rotate 1s cubic-bezier(.2,.7,.2,1),translate 1s cubic-bezier(.2,.7,.2,1);transform-origin:50% 100%;will-change:rotate,translate,opacity;}',
    '.kb3d-r.kb3d-l{rotate:y 24deg;translate:-50px 20px -120px;transform-origin:0 50%;}',
    '.kb3d-r.kb3d-rt{rotate:y -24deg;translate:50px 20px -120px;transform-origin:100% 50%;}',
    '.kb3d-r.kb3d-in{opacity:1;rotate:none;translate:none;}',
    '.kb3d-t{transform-style:preserve-3d;transition:rotate .5s cubic-bezier(.2,.7,.2,1),translate .5s cubic-bezier(.2,.7,.2,1),box-shadow .5s;position:relative;}',
    '.kb3d-t.kb3d-hov{transition:rotate .08s linear,translate .3s,box-shadow .3s;translate:0 -6px 30px;box-shadow:0 30px 60px -20px rgba(0,0,0,.75),0 0 0 1px rgba(245,200,66,.18),0 0 40px -10px rgba(245,200,66,.25)!important;}',
    '.kb3d-g{position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:3;opacity:0;transition:opacity .35s;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.16),rgba(245,200,66,.06) 30%,transparent 60%);mix-blend-mode:screen;}',
    '.kb3d-hov>.kb3d-g{opacity:1;}',
    '.hero-h1,h1{text-shadow:0 2px 24px rgba(0,0,0,.35);}',
    '.section-headline,section h2{text-shadow:none;}',
    '.kb3d-d{transition:translate .6s cubic-bezier(.2,.7,.2,1),rotate .6s cubic-bezier(.2,.7,.2,1);}'
  ].join('');
  var st = document.createElement('style'); st.id = 'kb3d-css'; st.textContent = css;
  document.head.appendChild(st);

  var CARD = '[class*="card"],.hp-item,.fee-card,.why-card,.course-card,.trust-card,.faq-item,.blog-card,.result-card,.testimonial,.stat,.pillar';
  var SKIP = '#kbs,nav,header,footer,form,dialog,[role="dialog"],.modal,[class*="modal"],[class*="popup"],[class*="drawer"],#kbx,.m-card,.kbx-page';

  function fixedAncestor(el) {
    for (var n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      var p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return true;
    }
    return false;
  }
  function usable(el) {
    if (el.closest(SKIP)) return false;
    if (el.querySelector('input,textarea,select,iframe,video')) return false;
    var r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 60 || r.width > innerWidth * 0.96) return false;
    if (getComputedStyle(el).position === 'fixed' || fixedAncestor(el)) return false;
    return true;
  }

  function init() {
    var cards = [].slice.call(document.querySelectorAll(CARD)).filter(usable);
    // keep only outermost cards (no nested tilt)
    cards = cards.filter(function (c) { return !cards.some(function (o) { return o !== c && o.contains(c); }); });

    var heads = [].slice.call(document.querySelectorAll('main h2, section h2, .section-headline, .section-kicker, section img, .founder-photo')).filter(function (el) {
      return !el.closest(SKIP) && !fixedAncestor(el) && el.getBoundingClientRect().top > innerHeight * 0.9;
    });

    // ── 3D reveal ──
    var reveal = cards.concat(heads).filter(function (el) { return el.getBoundingClientRect().top > innerHeight * 0.9; });
    var idx = new Map();
    reveal.forEach(function (el) {
      if (el.parentElement) el.parentElement.classList.add('kb3d-persp');
      var sibs = [].filter.call(el.parentElement ? el.parentElement.children : [], function (s) { return reveal.indexOf(s) > -1; });
      var i = sibs.indexOf(el); idx.set(el, i);
      el.classList.add('kb3d-r');
      if (el.tagName === 'IMG' || /photo/.test(el.className)) el.classList.add(i % 2 ? 'kb3d-rt' : 'kb3d-l');
    });
    var pending = reveal.slice(), ticking = false;
    function show(el) {
      el.style.transitionDelay = Math.min(idx.get(el) || 0, 5) * 90 + 'ms';
      el.classList.add('kb3d-in');
      setTimeout(function () { el.style.transitionDelay = ''; el.classList.remove('kb3d-r', 'kb3d-l', 'kb3d-rt', 'kb3d-in'); }, 1600 + (idx.get(el) || 0) * 90);
    }
    function check() {
      ticking = false;
      var lim = innerHeight * 0.92;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < lim || (r.width === 0 && r.height === 0)) { show(el); return false; }
        return true;
      });
      if (!pending.length) { removeEventListener('scroll', onS); removeEventListener('resize', onS); }
    }
    function onS() { if (!ticking) { ticking = true; requestAnimationFrame(check); } }
    addEventListener('scroll', onS, { passive: true }); addEventListener('resize', onS);
    check();

    // ── 3D tilt + glare ──
    if (fine) cards.forEach(function (c) {
      if (c.parentElement) c.parentElement.classList.add('kb3d-persp');
      c.classList.add('kb3d-t');
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      var g = document.createElement('span'); g.className = 'kb3d-g'; c.appendChild(g);
      var raf = 0;
      c.addEventListener('pointerenter', function () { c.classList.add('kb3d-hov'); });
      c.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          var mx = Math.min(12, 3600 / r.width);
          c.style.rotate = (0.5 - y) + ' ' + (x - 0.5) + ' 0 ' + mx + 'deg';
          c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
        });
      });
      c.addEventListener('pointerleave', function () { c.classList.remove('kb3d-hov'); c.style.rotate = ''; });
    });

    // ── Hero 3D parallax ──
    var hero = document.querySelector('#hero, .hero, header.hero, section[class*="hero"]');
    if (hero && fine) {
      var layers = [].slice.call(hero.querySelectorAll('.hero-visual,.hero-badge,.orbit-container,.hero-h1,.hero-proof,.hero-left,[data-depth]'));
      var depth = function (el) { return +(el.dataset.depth || (/visual|orbit|badge/.test(el.className) ? 40 : /h1/.test(el.className) ? 22 : 12)); };
      layers = layers.filter(function (l) { return !layers.some(function (o) { return o !== l && o.contains(l) && !/visual|orbit|badge/.test(l.className); }); });
      hero.classList.add('kb3d-persp');
      layers.forEach(function (l) { l.classList.add('kb3d-d'); });
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (l) {
          var d = depth(l);
          l.style.translate = (x * d) + 'px ' + (y * d) + 'px ' + d + 'px';
          l.style.rotate = (-y) + ' ' + x + ' 0 ' + d / 5 + 'deg';
        });
      });
      hero.addEventListener('pointerleave', function () { layers.forEach(function (l) { l.style.translate = ''; l.style.rotate = ''; }); });
    }
  }

  if (document.readyState === 'complete') setTimeout(init, 300);
  else window.addEventListener('load', function () { setTimeout(init, 300); });
})();

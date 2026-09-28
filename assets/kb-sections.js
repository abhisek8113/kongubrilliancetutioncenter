/* Kongu Brilliance — cinematic 3D treatment for every homepage section:
   giant scroll-parallax lettering + 3D camera entrance of each section's content */
(function () {
  if (window.__kbSec) return; window.__kbSec = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = { courses: 'LEARN', founder: 'MENTOR', why: 'DIFFERENT', promo: 'WATCH', centum: '100/100', fees: 'VALUE', trust: 'TRUST', quotes: 'MINDSET', contact: 'VISIT US' };
  const start = document.getElementById('kbp');
  if (!start) return;
  const secs = [];
  for (let s = start.nextElementSibling; s; s = s.nextElementSibling) {
    if (s.tagName !== 'SECTION' || s.id === 'hero' || getComputedStyle(s).display === 'none') continue;
    const word = words[s.id] || 'PRACTICE';
    s.classList.add('kbx3');
    const w = document.createElement('div'); w.className = 'kbx3-word' + (secs.length % 2 ? ' ol' : ''); w.setAttribute('aria-hidden', 'true'); w.textContent = word;
    s.insertBefore(w, s.firstChild);
    const inner = [...s.children].filter(c => c !== w && !/^(STYLE|SCRIPT)$/.test(c.tagName));
    inner.forEach(c => { c.classList.add('kbx3-in'); const cs = getComputedStyle(c); if (cs.position === 'static') { c.style.position = 'relative'; c.style.zIndex = 1; } });
    secs.push({ s, w, inner, dir: secs.length % 2 ? -1 : 1 });
  }
  if (reduce) return;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = x => 1 - Math.pow(1 - x, 3);
  let ticking = false;
  function update() {
    ticking = false;
    const vh = innerHeight;
    for (const o of secs) {
      const r = o.s.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const q = clamp((vh - r.top) / (vh + r.height), 0, 1);                 // 0 = entering, 1 = leaving
      o.w.style.transform = `translate3d(${((.5 - q) * 60 * o.dir).toFixed(2)}vw,0,0)`;
      const e = ease(clamp((vh - r.top) / (vh * .75), 0, 1));                 // entrance
      const tf = e >= .999 ? '' : `perspective(1400px) rotateX(${((1 - e) * 16).toFixed(2)}deg) translate3d(0,${((1 - e) * 90).toFixed(1)}px,${((1 - e) * -160).toFixed(1)}px)`;
      const op = (.15 + .85 * e).toFixed(3);
      for (const c of o.inner) { c.style.transform = tf; c.style.opacity = e >= .999 ? '' : op; }
    }
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); update();
})();

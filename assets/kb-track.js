/* Kongu Brilliance — lead-event tracking + mobile sticky Call/WhatsApp bar.
   Pushes GA4-style events to the GTM dataLayer (GTM-WDRRP8ZD):
   phone_click, whatsapp_click, directions_click, email_click, cta_click,
   enquiry_submit, contact_form_submit.
   In GTM: create a Custom Event trigger per event name and a GA4 Event tag for each
   (mark phone_click / whatsapp_click / enquiry_submit as Key Events in GA4). */
(function () {
  'use strict';
  var W = window, D = document;
  W.dataLayer = W.dataLayer || [];
  function push(name, extra) {
    var o = { event: name, page_path: location.pathname };
    for (var k in extra) o[k] = extra[k];
    try { W.dataLayer.push(o); } catch (e) {}
  }
  function txt(el) { return (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 60); }

  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var loc = a.closest('[data-cta-loc]');
    var p = { link_url: href, cta_text: txt(a), cta_location: loc ? loc.getAttribute('data-cta-loc') : (a.closest('#kb-sticky') ? 'sticky_bar' : '') };
    if (/^tel:/i.test(href)) { p.phone_number = href.replace(/^tel:/i, ''); push('phone_click', p); }
    else if (/wa\.me|whatsapp\.com/i.test(href)) push('whatsapp_click', p);
    else if (/google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(href)) push('directions_click', p);
    else if (/^mailto:/i.test(href)) push('email_click', p);
    else if (a.hasAttribute('data-cta') || /(^|\s)(cta|kx-btn|btn)(\s|$)/.test(a.className || '')) push('cta_click', p);
  }, true);

  D.addEventListener('submit', function (e) {
    var f = e.target, id = (f.id || f.getAttribute('name') || '').toLowerCase();
    var isContact = /contact/.test(id) || /contact/.test(location.pathname);
    push(isContact ? 'contact_form_submit' : 'enquiry_submit', { form_id: f.id || '' });
  }, true);

  /* Mobile sticky Call / WhatsApp bar — only where the page has no bar of its own */
  function addBar() {
    if (D.querySelector('.mobar,#kb-sticky') || D.documentElement.hasAttribute('data-no-sticky')) return;
    var msg = encodeURIComponent('Hi Kongu Brilliance, I would like to know about tuition classes. Page: ' + location.pathname);
    var bar = D.createElement('div');
    bar.id = 'kb-sticky';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Quick contact');
    bar.innerHTML = '<a href="tel:+919514524599">📞 Call 95145 24599</a><a href="https://wa.me/919514524599?text=' + msg + '" target="_blank" rel="noopener">💬 WhatsApp</a>';
    var css = D.createElement('style');
    css.textContent = '#kb-sticky{position:fixed;left:0;right:0;bottom:0;z-index:8000;display:none;background:#0a0b12;border-top:1px solid rgba(255,255,255,.18);font-family:system-ui,sans-serif}' +
      '#kb-sticky a{flex:1;text-align:center;padding:14px 8px;font-weight:800;font-size:15px;text-decoration:none;color:#FFE27A}' +
      '#kb-sticky a+a{color:#25D366;border-left:1px solid rgba(255,255,255,.18)}' +
      '@media(max-width:760px){#kb-sticky{display:flex}body{padding-bottom:56px}}';
    D.head.appendChild(css);
    D.body.appendChild(bar);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', addBar); else addBar();
})();

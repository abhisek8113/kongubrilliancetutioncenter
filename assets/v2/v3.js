/* Kongu Brilliance v3 — presentation-style deck */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const slides = $$('.slide'), dots = $('#dots'), counter = $('#counter'), nav = $('#nav');
const pad = n => String(n).padStart(2, '0');
counter.querySelector('span').textContent = '/ ' + pad(slides.length);
slides.forEach((s, i) => { if (!s.id) s.id = 's' + (i + 1); const a = document.createElement('a'); a.href = '#' + s.id; a.innerHTML = `<span>${s.dataset.name || ''}</span>`; a.setAttribute('aria-label', s.dataset.name || 'Slide ' + (i + 1)); dots.appendChild(a); });
const dl = $$('a', dots);
function activate(i) {
  slides.forEach((s, k) => { if (k === i) s.classList.add('act'); });
  dl.forEach((d, k) => d.classList.toggle('on', k === i));
  counter.querySelector('b').textContent = pad(i + 1);
  const s = slides[i]; document.body.dataset.t = s.classList.contains('dark') || s.id === 'kbp' ? 'dark' : 'light';
  $$('.scr', s).forEach(x => x.classList.add('on'));
  $$('[data-count]', s).forEach(el => { if (el.dataset.done) return; el.dataset.done = 1; const n = +el.dataset.count, t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); });
}
let cur = 0;
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { cur = slides.indexOf(e.target); activate(cur); } }), { threshold: .5 });
slides.forEach(s => io.observe(s));
if (reduce) slides.forEach(s => s.classList.add('act'));
activate(0);
addEventListener('scroll', () => nav.classList.toggle('sc', scrollY > 20), { passive: true });
addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (['ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); slides[Math.min(slides.length - 1, cur + 1)].scrollIntoView({ behavior: 'smooth' }); }
  if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); slides[Math.max(0, cur - 1)].scrollIntoView({ behavior: 'smooth' }); }
});
if (!reduce) import('three').then(hero3d).catch(() => {});
function hero3d(THREE) {
  const canvas = $('#h3d'), host = canvas.parentElement, small = innerWidth < 640;
  const R = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const env = new THREE.Scene(); env.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0c1733, side: THREE.BackSide })));
  [[0, 4.9, 0, 0xffffff, 6, 6], [-4.9, 1, 2, 0xFFD89A, 3, 5], [4.9, 0, -1, 0x9fd8ff, 2.5, 5], [0, -2, 4.9, 0xffffff, 3, 2]].forEach(([x, y, z, c, w, h]) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); l.position.set(x, y, z); l.lookAt(0, 0, 0); env.add(l); });
  scene.environment = new THREE.PMREMGenerator(R).fromScene(env, .02).texture;
  const cam = new THREE.PerspectiveCamera(32, 1, .1, 100); cam.position.set(0, 1.4, 14);
  const key = new THREE.DirectionalLight(0xFFE7B0, 2.4); key.position.set(4, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fd8ff, 1.6); rim.position.set(-6, 2, -5); scene.add(rim); scene.add(new THREE.AmbientLight(0x334466, .5));
  const M = { gold: new THREE.MeshPhysicalMaterial({ color: 0xE8B54A, metalness: 1, roughness: .18, clearcoat: .6 }), ink: new THREE.MeshPhysicalMaterial({ color: 0x0b1024, metalness: .35, roughness: .3, clearcoat: 1, clearcoatRoughness: .1 }),
    navy: new THREE.MeshPhysicalMaterial({ color: 0x1b2f73, metalness: .25, roughness: .32, clearcoat: 1, clearcoatRoughness: .12 }), paper: new THREE.MeshStandardMaterial({ color: 0xF6EFDC, roughness: .75, side: THREE.DoubleSide }) };
  const mesh = (g, m, p = [0, 0, 0], r = [0, 0, 0]) => { const o = new THREE.Mesh(g, m); o.position.set(...p); o.rotation.set(...r); return o; };
  const rig = new THREE.Group(); scene.add(rig);
  const book = new THREE.Group(); rig.add(book); const W = 2.6, D = 3.6;
  const cover = s => { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(W, .08, D), M.navy, [s * W / 2, 0, 0])); g.add(mesh(new THREE.BoxGeometry(W - .1, .02, .05), M.gold, [s * W / 2, .05, D / 2 - .15]), mesh(new THREE.BoxGeometry(W - .1, .02, .05), M.gold, [s * W / 2, .05, -D / 2 + .15])); g.rotation.z = s * .12; return g; };
  book.add(cover(-1), cover(1));
  const block = s => { const b = mesh(new THREE.BoxGeometry(W - .15, .22, D - .15), M.paper, [s * (W / 2 - .02), .15, 0]); const g = new THREE.Group(); g.add(b); g.rotation.z = s * .12; return g; };
  book.add(block(-1), block(1), mesh(new THREE.CylinderGeometry(.12, .12, D, 16), M.gold, [0, 0, 0], [Math.PI / 2, 0, 0]));
  const tc = document.createElement('canvas'); tc.width = 512; tc.height = 700; const x = tc.getContext('2d');
  x.fillStyle = '#F6EFDC'; x.fillRect(0, 0, 512, 700); x.strokeStyle = 'rgba(80,110,170,.3)'; x.lineWidth = 2; for (let y = 90; y < 680; y += 34) { x.beginPath(); x.moveTo(40, y); x.lineTo(480, y); x.stroke(); }
  x.fillStyle = '#1d2a5a'; x.font = 'italic 36px Georgia'; x.fillText('x = (−b ± √(b²−4ac)) / 2a', 46, 190); x.fillText('a² + b² = c²', 46, 292); x.fillStyle = '#a8761a'; x.fillText('E = mc²', 46, 394); x.fillStyle = '#1d2a5a'; x.fillText('sin²θ + cos²θ = 1', 46, 496);
  const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace; const pageMat = new THREE.MeshStandardMaterial({ map: tex, roughness: .8, side: THREE.DoubleSide });
  const pages = []; for (let i = 0; i < 4; i++) { const pg = new THREE.Group(); pg.add(mesh(new THREE.PlaneGeometry(W - .2, D - .25), i === 1 ? pageMat : M.paper, [(W - .2) / 2, 0, 0], [-Math.PI / 2, 0, 0])); pg.position.y = .27; pg.userData.ph = i / 4; book.add(pg); pages.push(pg); }
  book.rotation.set(.5, -.4, 0); book.position.y = -1.1;
  const cap = new THREE.Group(); rig.add(cap);
  cap.add(mesh(new THREE.BoxGeometry(3, .1, 3), M.ink), mesh(new THREE.CylinderGeometry(1, 1.15, .85, 64, 1, true), M.ink, [0, -.45, 0]), mesh(new THREE.CylinderGeometry(1, 1, .02, 64), M.ink, [0, -.87, 0]), mesh(new THREE.SphereGeometry(.12, 24, 16), M.gold, [0, .09, 0]),
    mesh(new THREE.CylinderGeometry(.018, .018, 1.8, 8), M.gold, [.64, .08, .64], [0, -Math.PI / 4, Math.PI / 2 - .02]));
  const tassel = new THREE.Group(); tassel.position.set(1.28, .08, 1.28); cap.add(tassel);
  tassel.add(mesh(new THREE.CylinderGeometry(.018, .018, 1, 8), M.gold, [0, -.5, 0]), mesh(new THREE.ConeGeometry(.12, .45, 20), M.gold, [0, -1.15, 0]));
  cap.position.y = 1.9; cap.rotation.set(.35, .6, -.08);
  const ring = mesh(new THREE.TorusGeometry(4, .01, 8, 220), new THREE.MeshBasicMaterial({ color: 0xE7B44A, transparent: true, opacity: .22 }), [0, .1, 0], [Math.PI / 2 - .25, 0, 0]); rig.add(ring);
  const halo = mesh(new THREE.CircleGeometry(3.6, 64), new THREE.MeshBasicMaterial({ color: 0xE7B44A, transparent: true, opacity: .07, depthWrite: false }), [0, -2.3, 0], [-Math.PI / 2, 0, 0]); rig.add(halo);
  function size() { const w = host.clientWidth, h = host.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    const vw = 2 * 14 * Math.tan(THREE.MathUtils.degToRad(16)) * cam.aspect; rig.position.x = 0; rig.scale.setScalar(small ? .45 : .75); rig.userData.y = small ? -2.9 : -2.5; }
  size(); addEventListener('resize', size);
  let mx = 0, my = 0, tx = 0, ty = 0, on = true; addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  new IntersectionObserver(es => on = es[0].isIntersecting).observe(host);
  const ease = v => 1 - Math.pow(1 - v, 3), t0 = performance.now(); canvas.style.opacity = 1;
  (function loop(now) { requestAnimationFrame(loop); if (!on || document.hidden) return; const t = (now - t0) / 1000; mx += (tx - mx) * .05; my += (ty - my) * .05;
    const k = ease(Math.min(1, t / 1.8)); rig.position.y = rig.userData.y + (1 - k) * 3 + Math.sin(t * .8) * .08; rig.rotation.y = (1 - k) * -1.6 + mx * .45 + Math.sin(t * .25) * .12; rig.rotation.x = my * .15;
    cap.rotation.y = .6 + t * .3; cap.position.y = 1.9 + Math.sin(t * 1.1) * .13; tassel.rotation.z = Math.sin(t * 2) * .16;
    pages.forEach(pg => { const q = (t * .08 + pg.userData.ph) % 1, f = ease(Math.max(0, Math.min(1, (q - .1) / .6))); pg.rotation.z = .12 + f * (Math.PI - .24); pg.position.y = .27 + Math.sin(f * Math.PI) * .3; });
    ring.rotation.z = t * .08; R.render(scene, cam); })(t0);
}

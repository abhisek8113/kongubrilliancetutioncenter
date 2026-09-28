/* Kongu Brilliance — cinematic hero: giant type + real-time 3D centrepiece, scroll-driven */
const hero = document.getElementById('kbh');
if (hero) initHero();

function initHero() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = innerWidth < 820;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const $ = s => hero.querySelector(s);
  const back = $('.h-back'), front = $('.h-front'), top = $('.h-top'), tag = $('.h-tag'), bot = $('.h-bot'), glow = $('.h-glow');

  // split giant words into letters for the intro
  hero.querySelectorAll('.h-split').forEach(el => {
    el.innerHTML = [...el.textContent].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');
  });
  requestAnimationFrame(() => hero.classList.add('go'));

  let p = 0, tp = 0;
  const read = () => { const r = hero.getBoundingClientRect(); tp = clamp(-r.top / (hero.offsetHeight - innerHeight), 0, 1); };
  addEventListener('scroll', read, { passive: true }); addEventListener('resize', read); read();

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });

  let render3d = null;
  if (!reduce) import('three').then(T => { render3d = scene3d(T); }).catch(() => {});

  let on = true;
  new IntersectionObserver(es => on = es[0].isIntersecting).observe(hero);
  const t0 = performance.now();
  (function loop(now) {
    requestAnimationFrame(loop);
    if (!on || document.hidden) return;
    p += (tp - p) * .09; mx += (tx - mx) * .06; my += (ty - my) * .06;
    const a = ease(clamp(p / .55, 0, 1)), b = ease(clamp((p - .35) / .45, 0, 1));
    back.style.transform = `translate3d(${(-a * 38 + mx * -2).toFixed(2)}vw,${(my * -1.5).toFixed(2)}vh,0) scale(${(1 + a * .25).toFixed(3)})`;
    front.style.transform = `translate3d(${(a * 38 + mx * 2).toFixed(2)}vw,${(my * 1.5).toFixed(2)}vh,0) scale(${(1 + a * .25).toFixed(3)})`;
    back.style.opacity = front.style.opacity = (1 - a * 1.1).toFixed(3);
    top.style.opacity = bot.style.opacity = (1 - a * 1.6).toFixed(3);
    tag.style.opacity = b.toFixed(3);
    tag.style.transform = `translate3d(0,${((1 - b) * 40).toFixed(1)}px,0) scale(${(.92 + b * .08).toFixed(3)})`;
    tag.style.setProperty('--b', b.toFixed(3));
    hero.style.setProperty('--p', p.toFixed(4));
    glow.style.transform = `scale(${(1 + a * .8).toFixed(3)})`;
    if (render3d) render3d((now - t0) / 1000, p, mx, my);
  })(t0);

  function scene3d(THREE) {
    const canvas = $('#kbh3d');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
    const scene = new THREE.Scene();
    // studio lighting environment (procedural, no downloads)
    const envScene = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0b1020, side: THREE.BackSide })); envScene.add(box);
    [[0, 4.9, 0, 0xffffff, 6, 6], [-4.9, 1, 2, 0xFFD27A, 3, 5], [4.9, 0, -1, 0x7fe9ff, 2.5, 5], [0, -2, 4.9, 0xffffff, 3, 2]].forEach(([x, y, z, c, w, h]) => {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); l.position.set(x, y, z); l.lookAt(0, 0, 0); envScene.add(l);
    });
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(envScene, 0.02).texture;
    const cam = new THREE.PerspectiveCamera(35, 1, .1, 100); cam.position.set(0, 1.2, 13);
    const key = new THREE.DirectionalLight(0xFFE3A0, 2.5); key.position.set(4, 8, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0x2EE6B0, 2); rim.position.set(-6, 2, -5); scene.add(rim);
    scene.add(new THREE.AmbientLight(0x334466, .5));

    const M = {
      gold: new THREE.MeshPhysicalMaterial({ color: 0xF2C14E, metalness: 1, roughness: .16, clearcoat: .6 }),
      ink: new THREE.MeshPhysicalMaterial({ color: 0x0c1122, metalness: .35, roughness: .28, clearcoat: 1, clearcoatRoughness: .1 }),
      navy: new THREE.MeshPhysicalMaterial({ color: 0x14245e, metalness: .25, roughness: .3, clearcoat: 1, clearcoatRoughness: .12 }),
      paper: new THREE.MeshStandardMaterial({ color: 0xF6EFDC, roughness: .75, side: THREE.DoubleSide }),
      glow: new THREE.MeshBasicMaterial({ color: 0x2EE6B0, transparent: true, opacity: .85 })
    };
    const mesh = (g, m, pos = [0, 0, 0], rot = [0, 0, 0]) => { const o = new THREE.Mesh(g, m); o.position.set(...pos); o.rotation.set(...rot); return o; };
    const rig = new THREE.Group(); scene.add(rig);

    /* the book: covers, page block and animated turning pages */
    const book = new THREE.Group(); rig.add(book);
    const W = 2.6, D = 3.6;
    const cover = s => { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(W, .08, D), M.navy, [s * W / 2, 0, 0]));
      g.add(mesh(new THREE.BoxGeometry(W - .1, .02, .05), M.gold, [s * W / 2, .05, D / 2 - .15])); g.add(mesh(new THREE.BoxGeometry(W - .1, .02, .05), M.gold, [s * W / 2, .05, -D / 2 + .15])); return g; };
    const cl = cover(-1), cr = cover(1); cl.rotation.z = -.12; cr.rotation.z = .12; book.add(cl, cr);
    const block = s => mesh(new THREE.BoxGeometry(W - .15, .22, D - .15), M.paper, [s * (W / 2 - .02), .15, 0]);
    const bl = block(-1), br = block(1); bl.rotation.z = -.12; br.rotation.z = .12; book.add(bl, br);
    book.add(mesh(new THREE.CylinderGeometry(.12, .12, D, 16), M.gold, [0, 0, 0], [Math.PI / 2, 0, 0]));
    // ruled lines drawn on a canvas texture for the open pages
    const tc = document.createElement('canvas'); tc.width = 512; tc.height = 700; const x = tc.getContext('2d');
    x.fillStyle = '#F6EFDC'; x.fillRect(0, 0, 512, 700); x.strokeStyle = 'rgba(80,110,170,.35)'; x.lineWidth = 2;
    for (let y = 90; y < 680; y += 34) { x.beginPath(); x.moveTo(40, y); x.lineTo(480, y); x.stroke(); }
    x.fillStyle = '#1d2a5a'; x.font = 'italic 38px Georgia'; x.fillText('x = (−b ± √(b²−4ac)) / 2a', 46, 190); x.fillText('a² + b² = c²', 46, 292); x.fillStyle = '#b8860b'; x.fillText('E = mc²', 46, 394); x.fillStyle = '#1d2a5a'; x.fillText('sin²θ + cos²θ = 1', 46, 496); x.fillText('H₂ + O₂ → H₂O', 46, 598);
    const pageTex = new THREE.CanvasTexture(tc); pageTex.colorSpace = THREE.SRGBColorSpace;
    const pageMat = new THREE.MeshStandardMaterial({ map: pageTex, roughness: .8, side: THREE.DoubleSide });
    const pages = [];
    for (let i = 0; i < 5; i++) {
      const pg = new THREE.Group(); const pl = mesh(new THREE.PlaneGeometry(W - .2, D - .25, 12, 1), i === 2 ? pageMat : M.paper, [(W - .2) / 2, 0, 0], [-Math.PI / 2, 0, 0]);
      pg.add(pl); pg.position.y = .27; pg.userData.ph = i / 5; book.add(pg); pages.push(pg);
    }
    book.rotation.set(.55, -.35, 0); book.position.set(0, -1.1, 0);

    /* graduation cap floating above */
    const cap = new THREE.Group(); rig.add(cap);
    cap.add(mesh(new THREE.BoxGeometry(3, .1, 3), M.ink), mesh(new THREE.CylinderGeometry(1, 1.15, .85, 64, 1, true), M.ink, [0, -.45, 0]),
      mesh(new THREE.CylinderGeometry(1, 1, .02, 64), M.ink, [0, -.87, 0]), mesh(new THREE.SphereGeometry(.12, 24, 16), M.gold, [0, .09, 0]),
      mesh(new THREE.CylinderGeometry(.018, .018, 1.8, 8), M.gold, [.64, .08, .64], [0, -Math.PI / 4, Math.PI / 2 - .02]));
    const tassel = new THREE.Group(); tassel.position.set(1.28, .08, 1.28); cap.add(tassel);
    tassel.add(mesh(new THREE.CylinderGeometry(.018, .018, 1, 8), M.gold, [0, -.5, 0]), mesh(new THREE.ConeGeometry(.12, .45, 20), M.gold, [0, -1.15, 0]));
    cap.position.set(0, 1.9, 0); cap.rotation.set(.35, .6, -.08); cap.scale.setScalar(.95);

    /* orbiting formulas */
    const label = (txt, col) => { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d');
      g.font = 'italic 500 60px Georgia'; g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 6; g.fillText(txt, 256, 64);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(1.7, .42, 1); return s; };
    const orbit = new THREE.Group(); rig.add(orbit);
    const syms = [['π', '#F5C842'], ['E = mc²', '#d7e6ff'], ['√x', '#F5C842'], ['H₂O', '#bfeede'], ['a² + b²', '#F5C842']];
    const sprites = syms.map(([t, c], i) => { const s = label(t, c); s.userData.a = i / syms.length * Math.PI * 2; orbit.add(s); return s; });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xF5C842, transparent: true, opacity: .18 });
    const ring1 = mesh(new THREE.TorusGeometry(4.2, .012, 8, 200), ringMat, [0, .2, 0], [Math.PI / 2 - .25, 0, 0]);
    const ring2 = mesh(new THREE.TorusGeometry(3.4, .01, 8, 200), M.glow, [0, .2, 0], [Math.PI / 2 + .35, .3, 0]); ring2.material = M.glow.clone(); ring2.material.opacity = .14;
    rig.add(ring1, ring2);
    // soft floor reflection glow
    const halo = mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshBasicMaterial({ color: 0xF5C842, transparent: true, opacity: .08, depthWrite: false }), [0, -2.2, 0], [-Math.PI / 2, 0, 0]); rig.add(halo);

    function size() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); rig.scale.setScalar(small ? .62 : 1); }
    size(); addEventListener('resize', size);
    canvas.style.opacity = 1;

    return (t, p, mx, my) => {
      const intro = ease(clamp(t / 2.2, 0, 1));
      // intro: drop in and settle; scroll: turn and dolly in
      rig.position.y = (1 - intro) * 6 + Math.sin(t * .8) * .08;
      rig.rotation.y = (1 - intro) * -2.5 + mx * .5 + p * Math.PI * 1.2 + Math.sin(t * .3) * .08;
      rig.rotation.x = my * .2 + p * .35;
      cam.position.z = 13 - ease(clamp(p / .7, 0, 1)) * 3.2; cam.position.y = 1.2 - p * .8; cam.lookAt(0, .2 - p * .6, 0);
      cap.rotation.y = .6 + t * .35; cap.position.y = 1.9 + Math.sin(t * 1.1) * .15 + p * 1.2;
      tassel.rotation.z = Math.sin(t * 2.2) * .18; tassel.rotation.x = Math.cos(t * 1.7) * .12;
      pages.forEach(pg => { const k = ((t * .09 + pg.userData.ph) % 1); const f = ease(clamp((k - .1) / .6, 0, 1)); pg.rotation.z = .12 + f * (Math.PI - .24); pg.position.y = .27 + Math.sin(f * Math.PI) * .35; });
      sprites.forEach((s, i) => { const a = s.userData.a + t * .25; const r = 4.2; s.position.set(Math.cos(a) * r, .2 + Math.sin(a * 2 + i) * .5, Math.sin(a) * r); s.material.opacity = .25 + .5 * Math.max(0, Math.sin(a)); });
      ring1.rotation.z = t * .1; ring2.rotation.z = -t * .14;
      renderer.render(scene, cam);
    };
  }
}

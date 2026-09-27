/* Kongu Brilliance — premium home: section reveals + a real-time 3D "learning world" behind the whole page */
let THREE, RoomEnvironment;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.getElementById('kbs');

/* ── reveal sections as they come into view ── */
if (root) {
  const secs = root.querySelectorAll('.kx-sec');
  if (reduce || !('IntersectionObserver' in window)) secs.forEach(s => s.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.2 });
    secs.forEach(s => io.observe(s));
  }
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let raf = 0, ex = 0, ey = 0;
    addEventListener('pointermove', e => { ex = e.clientX / innerWidth - .5; ey = e.clientY / innerHeight - .5;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; root.style.setProperty('--mx', ex.toFixed(3)); root.style.setProperty('--my', ey.toFixed(3)); }); }, { passive: true });
  }
  // nav "Home" links point at the new hero
  document.querySelectorAll('a[href="#hero"]').forEach(a => a.setAttribute('href', '#top'));
}

/* ── 3D world ── */
const canvas = document.getElementById('kbWorld');
if (canvas && !reduce) Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')])
  .then(([T, R]) => { THREE = T; RoomEnvironment = R.RoomEnvironment; world(); }).catch(() => canvas.remove());

function world() {
  const small = innerWidth < 820;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.fog = new THREE.Fog(0x04060D, 14, 34);
  const FOV = 40, CZ = 14;
  const cam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80); cam.position.z = CZ;
  const UNIT = 2 * CZ * Math.tan(THREE.MathUtils.degToRad(FOV / 2)); // world units per screen height at z=0

  const key = new THREE.DirectionalLight(0xFFE3A0, 2.2); key.position.set(5, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x2EE6B0, 1.4); rim.position.set(-6, -2, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0x223355, .6));

  /* materials */
  const M = {
    gold: new THREE.MeshPhysicalMaterial({ color: 0xF2C14E, metalness: 1, roughness: .2, clearcoat: .5 }),
    goldR: new THREE.MeshPhysicalMaterial({ color: 0xE3A21F, metalness: 1, roughness: .38 }),
    navy: new THREE.MeshPhysicalMaterial({ color: 0x172554, metalness: .2, roughness: .3, clearcoat: 1, clearcoatRoughness: .15 }),
    ink: new THREE.MeshPhysicalMaterial({ color: 0x0b0f1c, metalness: .3, roughness: .35, clearcoat: 1 }),
    teal: new THREE.MeshPhysicalMaterial({ color: 0x16b98c, metalness: .25, roughness: .25, clearcoat: 1, emissive: 0x0a5a44, emissiveIntensity: .35 }),
    sky: new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, metalness: .2, roughness: .3, clearcoat: 1 }),
    coral: new THREE.MeshPhysicalMaterial({ color: 0xe85d5d, metalness: .15, roughness: .35, clearcoat: 1 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xF4ECD8, roughness: .85 }),
    glow: new THREE.MeshBasicMaterial({ color: 0x2EE6B0 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .05, transparent: true, opacity: .18, clearcoat: 1, envMapIntensity: 2 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xE8C9A0, roughness: .7 }),
    lead: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: .5 }),
    pink: new THREE.MeshStandardMaterial({ color: 0xF08A9A, roughness: .6 }),
    silver: new THREE.MeshPhysicalMaterial({ color: 0xcfd6e0, metalness: 1, roughness: .25 })
  };
  const mesh = (g, m, p = [0, 0, 0], r = [0, 0, 0]) => { const o = new THREE.Mesh(g, m); o.position.set(...p); o.rotation.set(...r); return o; };
  const grp = (...c) => { const g = new THREE.Group(); c.forEach(x => g.add(x)); return g; };
  const ext = (shape, d = .35) => new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: .06, bevelSize: .05, bevelSegments: 4, curveSegments: 24 });

  /* models */
  const B = {
    cap() {
      const tassel = grp(mesh(new THREE.CylinderGeometry(.02, .02, 1.1, 8), M.gold, [1.35, -.45, 1.35]), mesh(new THREE.ConeGeometry(.12, .45, 16), M.gold, [1.35, -1.1, 1.35]));
      return grp(mesh(new THREE.BoxGeometry(3.2, .12, 3.2), M.ink), mesh(new THREE.CylinderGeometry(1.05, 1.2, .95, 48, 1, true), M.ink, [0, -.5, 0]),
        mesh(new THREE.CylinderGeometry(1.05, 1.05, .02, 48), M.ink, [0, -.97, 0]), mesh(new THREE.SphereGeometry(.13, 24, 16), M.gold, [0, .1, 0]),
        mesh(new THREE.CylinderGeometry(.02, .02, 1.9, 8), M.gold, [.68, .08, .68], [0, 0, Math.PI / 2 - .02]), tassel);
    },
    openBook() {
      const half = s => grp(mesh(new THREE.BoxGeometry(1.8, .06, 2.5), M.navy, [s * .92, -.05, 0]), mesh(new THREE.BoxGeometry(1.7, .16, 2.35), M.paper, [s * .9, .06, 0]));
      const L = half(-1), R = half(1); L.rotation.z = .2; R.rotation.z = -.2;
      return grp(L, R, mesh(new THREE.CylinderGeometry(.08, .08, 2.5, 12), M.gold, [0, -.1, 0], [Math.PI / 2, 0, 0]));
    },
    stack() {
      const bk = (w, d, h, m, y, ry) => grp(mesh(new THREE.BoxGeometry(w, h, d), m, [0, y, 0], [0, ry, 0]), mesh(new THREE.BoxGeometry(w - .12, h - .06, d + .02), M.paper, [.06, y, 0], [0, ry, 0]));
      return grp(bk(2.6, 1.9, .42, M.navy, 0, 0), bk(2.4, 1.8, .36, M.teal, .4, .18), bk(2.5, 1.85, .4, M.coral, .8, -.1), bk(2.2, 1.7, .34, M.sky, 1.18, .25));
    },
    pencil() {
      return grp(mesh(new THREE.CylinderGeometry(.22, .22, 3.4, 6), M.gold), mesh(new THREE.ConeGeometry(.22, .6, 6), M.wood, [0, 2, 0]), mesh(new THREE.ConeGeometry(.08, .22, 12), M.lead, [0, 2.2, 0]),
        mesh(new THREE.CylinderGeometry(.23, .23, .3, 24), M.silver, [0, -1.85, 0]), mesh(new THREE.CylinderGeometry(.22, .22, .35, 24), M.pink, [0, -2.15, 0]));
    },
    atom() {
      const g = grp(mesh(new THREE.IcosahedronGeometry(.45, 3), M.gold));
      const rings = [];
      for (let i = 0; i < 3; i++) {
        const r = grp(mesh(new THREE.TorusGeometry(1.7, .025, 12, 120), M.glow), mesh(new THREE.SphereGeometry(.12, 16, 12), M.gold, [1.7, 0, 0]));
        r.rotation.set(Math.PI / 2 + i * .9, i * 1.1, i * .5); g.add(r); rings.push(r);
      }
      g.userData.tick = t => rings.forEach((r, i) => r.children[1].position.set(Math.cos(t * (1.2 + i * .3) + i) * 1.7, Math.sin(t * (1.2 + i * .3) + i) * 1.7, 0));
      return g;
    },
    globe() {
      const s = new THREE.SphereGeometry(1.4, 32, 24);
      return grp(mesh(s, M.sky), new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.43, 16, 10)), new THREE.LineBasicMaterial({ color: 0xF5C842, transparent: true, opacity: .45 })),
        mesh(new THREE.TorusGeometry(1.7, .05, 12, 80, Math.PI * 1.3), M.gold, [0, 0, 0], [0, 0, -.9]), mesh(new THREE.CylinderGeometry(.08, .08, .6, 12), M.gold, [0, -2, 0]), mesh(new THREE.CylinderGeometry(.7, .8, .15, 32), M.gold, [0, -2.3, 0]));
    },
    trophy() {
      const pts = [[0, 0], [.9, 0], [.9, .15], [.35, .3], [.2, .9], [.25, 1.2], [1, 1.6], [1.15, 2.6], [1.2, 2.7], [0, 2.7]].map(p => new THREE.Vector2(p[0], p[1]));
      return grp(mesh(new THREE.LatheGeometry(pts, 48), M.gold, [0, -1.4, 0]), mesh(new THREE.BoxGeometry(1.8, .35, 1.8), M.ink, [0, -1.6, 0]),
        mesh(new THREE.TorusGeometry(.45, .07, 12, 40, Math.PI), M.gold, [1.15, .5, 0], [0, 0, -Math.PI / 2]), mesh(new THREE.TorusGeometry(.45, .07, 12, 40, Math.PI), M.gold, [-1.15, .5, 0], [0, 0, Math.PI / 2]));
    },
    bulb() {
      return grp(mesh(new THREE.SphereGeometry(1.1, 32, 24), M.glass, [0, .5, 0]), mesh(new THREE.IcosahedronGeometry(.35, 2), new THREE.MeshBasicMaterial({ color: 0xFFE08A }), [0, .45, 0]),
        mesh(new THREE.CylinderGeometry(.45, .5, .8, 24), M.silver, [0, -.75, 0]), new THREE.PointLight(0xFFD27A, 6, 6));
    },
    pi() { const s = new THREE.Shape(); s.moveTo(-1, .9); s.lineTo(1.1, .9); s.lineTo(1.1, .6); s.lineTo(.55, .6); s.lineTo(.6, -.9); s.lineTo(.3, -.9); s.lineTo(.25, .6); s.lineTo(-.3, .6); s.quadraticCurveTo(-.4, -.4, -.8, -.9); s.lineTo(-1.05, -.8); s.quadraticCurveTo(-.65, -.3, -.6, .6); s.lineTo(-1, .6); return mesh(ext(s), M.gold); },
    root() { const s = new THREE.Shape(); s.moveTo(-1.3, 0); s.lineTo(-.9, .15); s.lineTo(-.55, -.7); s.lineTo(.1, 1.1); s.lineTo(1.5, 1.1); s.lineTo(1.5, .85); s.lineTo(.3, .85); s.lineTo(-.5, -1.1); s.lineTo(-.7, -1.1); s.lineTo(-1.05, -.1); s.lineTo(-1.3, -.2); return mesh(ext(s), M.teal); },
    sigma() { const s = new THREE.Shape(); s.moveTo(-.9, 1.1); s.lineTo(.9, 1.1); s.lineTo(.9, .8); s.lineTo(-.4, .8); s.lineTo(.3, 0); s.lineTo(-.4, -.8); s.lineTo(.95, -.8); s.lineTo(.95, -1.1); s.lineTo(-.9, -1.1); s.lineTo(-.9, -.85); s.lineTo(-.05, 0); s.lineTo(-.9, .85); return mesh(ext(s), M.gold); },
    plus() { return grp(mesh(new THREE.BoxGeometry(1.6, .38, .38), M.coral), mesh(new THREE.BoxGeometry(.38, 1.6, .38), M.coral)); },
    orb() { return grp(mesh(new THREE.SphereGeometry(1, 48, 32), M.glass), mesh(new THREE.TorusGeometry(1.35, .012, 8, 140), M.glow, [0, 0, 0], [1.2, 0, 0])); }
  };

  /* placement: hero cluster, then objects drifting down the whole page */
  const items = [];
  const add = (o, x, y, z, s, spin = [.2, .3, 0], tilt = [0, 0, 0]) => { o.position.set(x, y, z); o.scale.setScalar(s); o.rotation.set(...tilt); o.userData.base = { x, y, z, spin, phase: Math.random() * 6 }; scene.add(o); items.push(o); return o; };
  let heroX = small ? .2 : 5.2, heroY = small ? 2.45 : .2, hs = small ? .5 : 1;
  add(B.cap(), heroX + .3 * hs, heroY + 1.5 * hs, 1, .85 * hs, [.05, .35, .05], [.35, .5, -.12]);
  add(B.openBook(), heroX - 1.4 * hs, heroY - 1.6 * hs, 2, .75 * hs, [.08, .2, 0], [.6, -.4, .1]);
  add(B.atom(), heroX + 2.3 * hs, heroY - 1.2 * hs, -1.5, .8 * hs, [.2, .3, .1]);
  add(B.pi(), heroX - 2.2 * hs, heroY + 1.9 * hs, -2, .55 * hs, [.1, .5, .05]);
  add(B.orb(), heroX + .9 * hs, heroY - 2.9 * hs, -3, .7 * hs, [.1, .2, 0]);
  add(B.pencil(), heroX + 3.1 * hs, heroY + 2.4 * hs, -2.5, .45 * hs, [.3, .2, .2], [0, 0, -.8]);

  const pool = ['stack', 'root', 'globe', 'sigma', 'trophy', 'bulb', 'pencil', 'plus', 'atom', 'pi', 'openBook', 'cap'];
  const docScreens = () => document.documentElement.scrollHeight / innerHeight;
  const spread = Math.min(small ? 10 : 16, Math.ceil(docScreens()) + 2);
  for (let i = 1; i < spread; i++) {
    const side = i % 2 ? 1 : -1, name = pool[(i - 1) % pool.length];
    const edge = small ? 2.6 : (innerWidth / innerHeight) * UNIT / 2 - 1.6;
    add(B[name](), side * (edge - Math.random() * .8), -i * UNIT * 1.05 + (Math.random() - .5) * 2, -2 - Math.random() * 4, (small ? .45 : .7) + Math.random() * .25, [.15 + Math.random() * .2, .25 + Math.random() * .3, .05], [Math.random(), Math.random() * 3, Math.random() * .5]);
  }

  /* sparkle dust */
  const DN = small ? 400 : 900, dp = new Float32Array(DN * 3);
  for (let i = 0; i < DN; i++) { dp[i * 3] = (Math.random() - .5) * 30; dp[i * 3 + 1] = -Math.random() * UNIT * spread * 1.05 + UNIT; dp[i * 3 + 2] = -Math.random() * 14 + 2; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xF5C842, size: .05, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })));

  function size() { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  size(); addEventListener('resize', size);

  let tx = 0, ty = 0, mx = 0, my = 0, lastY = scrollY, vel = 0;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  const clock = new THREE.Clock();
  canvas.style.opacity = 0; canvas.style.transition = 'opacity 1.4s ease';
  (function loop() {
    requestAnimationFrame(loop);
    if (document.hidden) { clock.getDelta(); return; }
    const t = clock.getElapsedTime();
    const sy = scrollY; vel += ((sy - lastY) - vel) * .12; lastY = sy;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    cam.position.set(mx * 1.2, -sy / innerHeight * UNIT - my * .8, CZ);
    cam.lookAt(mx * .4, cam.position.y, 0);
    for (const o of items) {
      const b = o.userData.base, sp = b.spin;
      o.rotation.x += sp[0] * .006 + vel * .0004; o.rotation.y += sp[1] * .006 + vel * .0006; o.rotation.z += sp[2] * .004;
      o.position.y = b.y + Math.sin(t * .7 + b.phase) * .18;
      if (o.userData.tick) o.userData.tick(t);
    }
    renderer.render(scene, cam);
    if (canvas.style.opacity === '0') canvas.style.opacity = 1;
  })();
}

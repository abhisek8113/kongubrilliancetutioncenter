/* Kongu Brilliance — cinematic scroll story + real-time WebGL 3D model (particles that morph per scene) */
const root = document.getElementById('kbs');
if (root) init();

function init() {
  const scenes = [...root.querySelectorAll('.sc')];
  const N = scenes.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prog = root.querySelector('#kbsProg');
  const loops = root.querySelectorAll('.lp');

  // progress dots
  scenes.forEach((_, i) => {
    const d = document.createElement('i');
    d.title = 'Scene ' + (i + 1);
    d.onclick = () => { T = i * D; jump = true; };
    prog.appendChild(d);
  });
  const dots = [...prog.children];

  // floating dust
  const dust = root.querySelector('#kbsDust');
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('i');
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${-Math.random() * 9}s;opacity:${0.1 + Math.random() * 0.35}`;
    dust.appendChild(s);
  }

  // classroom: teacher + students
  const desks = root.querySelector('#kbsDesks');
  const skin = ['#c98f66', '#b9825c', '#d9a07a', '#a8714e', '#c48a60'];
  const uni = ['#3b5bdb', '#1f7a6b', '#3b5bdb', '#7b4dd6', '#1f7a6b'];
  const hair = (i) => i % 2 ? '<path d="M24 32c0-16 10-24 22-24 14 0 22 10 20 24-4-7-12-11-22-10-9 1-16 4-20 10z" fill="#1b1410"/><path d="M24 32q-4 20 4 30M66 32q4 20-4 30" stroke="#1b1410" stroke-width="7" fill="none"/>' : '<path d="M24 32c0-16 10-24 22-24 14 0 22 10 20 24-4-7-12-11-22-10-9 1-16 4-20 10z" fill="#1b1410"/>';
  let h = '';
  for (let i = 0; i < 5; i++) {
    const hand = i === 1 || i === 3 ? '<path d="M70 70 L84 20" stroke="' + skin[i] + '" stroke-width="8" stroke-linecap="round"/><path d="M68 72 L82 30" stroke="' + uni[i] + '" stroke-width="10" stroke-linecap="round" opacity=".9"/>' : '';
    h += `<svg class="person" viewBox="0 0 92 120" aria-hidden="true">${hand}<path d="M8 120c0-30 17-46 38-46s38 16 38 46z" fill="${uni[i]}"/><rect x="40" y="62" width="12" height="14" rx="4" fill="${skin[i]}"/><ellipse cx="46" cy="42" rx="21" ry="23" fill="${skin[i]}"/>${hair(i)}<circle cx="38" cy="45" r="2.3" fill="#1b1410"/><circle cx="54" cy="45" r="2.3" fill="#1b1410"/><path d="M39 55q7 5 14 0" stroke="#7a4a30" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="0" y="104" width="92" height="16" rx="3" fill="#5a4636"/></svg>`;
    if (i === 1) h += `<svg class="person" style="width:clamp(60px,9vw,100px);margin-top:-40px" viewBox="0 0 92 140" aria-hidden="true"><path d="M8 140c0-36 17-56 38-56s38 20 38 56z" fill="#F5C842"/><path d="M36 84l10 14 10-14" fill="#fff"/><rect x="40" y="70" width="12" height="16" rx="4" fill="#b9825c"/><ellipse cx="46" cy="48" rx="22" ry="25" fill="#b9825c"/><path d="M23 40c0-18 11-27 24-27 15 0 24 11 22 27-4-8-13-12-24-11-10 1-17 5-22 11z" fill="#2b2b2b"/><path d="M30 42h12M50 42h12" stroke="#222" stroke-width="2"/><circle cx="37" cy="50" r="2.4" fill="#111"/><circle cx="55" cy="50" r="2.4" fill="#111"/><path d="M39 62q7 5 14 0" stroke="#6a3e28" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M80 100 L100 70" stroke="#b9825c" stroke-width="8" stroke-linecap="round"/></svg>`;
  }
  desks.innerHTML = h;

  // ── scroll → scene state ──
  const D = 4.6, HOLD = 0.8;           // seconds per scene, share of time holding
  let P = -0.3, targetP = -0.3, mx = 0, my = 0, T = 0, playing = true, jump = true;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = x => x * x * (3 - 2 * x);
  function timeline() {
    const total = D * N + 1.5;          // short rest on the final scene, then loop
    if (T >= total) { T = 0; jump = true; }
    const i = Math.min(N - 1, Math.floor(T / D)), f = (T - i * D) / D;
    if (i === N - 1) return Math.min(N - 1 + 0.2, N - 1 - 0.3 + 0.6 * Math.min(1, f / HOLD));
    return f < HOLD ? i - 0.3 + 0.6 * (f / HOLD) : i + 0.3 + 0.4 * ease((f - HOLD) / (1 - HOLD));
  }
  const pb = document.createElement('button');
  pb.className = 'kbs-play'; pb.type = 'button'; pb.setAttribute('aria-label', 'Pause animation'); pb.textContent = '❚❚';
  pb.onclick = () => { playing = !playing; pb.textContent = playing ? '❚❚' : '▶'; pb.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation'); };
  root.querySelector('.st').appendChild(pb);
  const bar = document.createElement('div'); bar.className = 'kbs-time'; bar.innerHTML = '<b></b>';
  root.querySelector('.st').appendChild(bar); const barFill = bar.firstChild;
  function apply(p) {
    root.style.setProperty('--p', (p / (N - 1)).toFixed(4));
    scenes.forEach((s, i) => {
      let e = p - i;
      if (i === N - 1) e = Math.min(e, 0.2);
      if (i === 0) e = Math.max(e, -0.3);
      if (e < -1 || e > 1) { s.style.opacity = 0; s.classList.remove('on'); s.style.visibility = 'hidden'; return; }
      s.style.visibility = 'visible';
      let op, z, blur = 0, ry = 0;
      if (e <= -0.3) { const k = clamp((e + 0.62) / 0.32, 0, 1); op = k; z = (1 - k) * -900; ry = (1 - k) * 16; }
      else if (e < 0.3) { op = 1; z = (e + 0.3) * 60; }
      else { const k = clamp((e - 0.3) / 0.25, 0, 1); op = 1 - k; z = 36 + k * 700; blur = k * 8; ry = -k * 8; }
      s.style.opacity = op.toFixed(3);
      s.style.transform = `translateZ(${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${(my * -3).toFixed(2)}deg) rotateY(${(mx * 4).toFixed(2)}deg)`;
      s.style.filter = blur ? `blur(${blur.toFixed(1)}px)` : '';
      s.style.setProperty('--r', clamp((e + 0.5) / 0.5, 0, 1).toFixed(3));
      s.style.setProperty('--a', clamp((e + 0.42) / 0.42, 0, 1).toFixed(3));
      s.classList.toggle('on', op > 0.6);
    });
    const cur = clamp(Math.round(p), 0, N - 1);
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    const a3 = clamp((p - 3 + 0.42) / 0.42, 0, 1);
    loops.forEach((l, i) => l.classList.toggle('on', a3 > 0.25 + i * 0.25));
  }

  if (reduce) { scenes.forEach(s => { s.style.setProperty('--r', 1); s.style.setProperty('--a', 1); }); return; }

  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  document.addEventListener('visibilitychange', () => { last = performance.now(); });
  apply(P);

  let three = null;
  loadThree().then(t => three = t).catch(() => {});

  let visible = true;
  new IntersectionObserver(es => visible = es[0].isIntersecting).observe(root);
  let last = performance.now();
  (function loop() {
    requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!visible) return;
    if (playing) T += dt;
    targetP = timeline();
    if (jump) { P = targetP; jump = false; } else P += (targetP - P) * 0.14;
    barFill.style.width = (Math.min(1, T / (D * N)) * 100).toFixed(2) + '%';
    apply(P);
    if (three) three(P, mx, my);
  })();

  // ── WebGL 3D model ──
  async function loadThree() {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    const canvas = root.querySelector('#kbs3d');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    cam.position.set(0, 0, 9);
    const small = innerWidth < 820;
    const COUNT = small ? 2600 : 5200;

    const rnd = (a, b) => a + Math.random() * (b - a);
    const shapes = [];
    // 0: question mark (from glyph raster)
    shapes.push(glyph('?', 4.2));
    // 1: brain / neural sphere
    shapes.push(fill(i => { const k = i + 0.5, phi = Math.acos(1 - 2 * k / COUNT), th = Math.PI * (1 + Math.sqrt(5)) * k; const r = 2.4 + Math.sin(th * 3) * 0.12 + Math.cos(phi * 7) * 0.1; return [r * Math.cos(th) * Math.sin(phi) * 1.15, r * Math.cos(phi) * 0.9, r * Math.sin(th) * Math.sin(phi)]; }));
    // 2: stack of papers
    shapes.push(fill(i => { const l = i % 6; return [rnd(-1.6, 1.6) + (l - 2.5) * 0.35, rnd(-2.1, 2.1) + (l - 2.5) * 0.18, (l - 2.5) * 0.45 + rnd(-0.02, 0.02)]; }));
    // 3: tablet slab
    shapes.push(fill(() => { const f = Math.random(); if (f < 0.75) return [rnd(-3, 3), rnd(-2.1, 2.1), f < 0.4 ? 0.12 : -0.12]; const e = Math.random() < 0.5; return e ? [Math.sign(rnd(-1, 1)) * 3, rnd(-2.1, 2.1), rnd(-0.12, 0.12)] : [rnd(-3, 3), Math.sign(rnd(-1, 1)) * 2.1, rnd(-0.12, 0.12)]; }));
    // 4: two learners + AI core
    shapes.push(fill(i => { const g = i % 3; const c = [[-3.2, 0, 0], [0, 0, 0], [3.2, 0, 0]][g]; const r = g === 1 ? 0.9 : 1.3; const u = rnd(0, Math.PI * 2), v = Math.acos(rnd(-1, 1)); if (Math.random() < 0.18) { const t = Math.random(); return [(g === 0 ? -1 : 1) * (0.9 + t * 1.2), Math.sin(t * 9) * 0.15, 0]; } return [c[0] + r * Math.cos(u) * Math.sin(v), c[1] + r * Math.cos(v), c[2] + r * Math.sin(u) * Math.sin(v)]; }));
    // 5: classroom wave floor + board
    shapes.push(fill(() => { if (Math.random() < 0.45) return [rnd(-3.4, 3.4), rnd(0.2, 2.6), -1]; const x = rnd(-4, 4), z = rnd(-1, 3); return [x, -1.6 + Math.sin(x * 1.3) * 0.18 + Math.cos(z * 2) * 0.12, z]; }));
    // 6: rising 3D bar chart
    shapes.push(fill(i => { const b = i % 6, hgt = 0.8 + b * 0.62; return [(b - 2.5) * 1.05 + rnd(-0.32, 0.32), -2 + rnd(0, hgt), rnd(-0.32, 0.32)]; }));
    // 7: flame + ring (brand)
    shapes.push(fill(i => { if (i % 3 === 0) { const a = rnd(0, Math.PI * 2); const r = 2.9 + rnd(-0.05, 0.05); return [Math.cos(a) * r, Math.sin(a) * r, rnd(-0.1, 0.1)]; } const t = Math.random(), y = -1.8 + t * 3.8, w = Math.sin(Math.PI * Math.pow(t, 0.7)) * 1.35 * (1 - t * 0.35); const a = rnd(0, Math.PI * 2), rr = Math.sqrt(Math.random()) * w; return [Math.cos(a) * rr + Math.sin(t * 5) * 0.2 * t, y, Math.sin(a) * rr * 0.6]; }));

    function fill(fn) { const a = new Float32Array(COUNT * 3); for (let i = 0; i < COUNT; i++) { const p = fn(i); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; } return a; }
    function glyph(ch, size) {
      const c = document.createElement('canvas'); c.width = c.height = 200; const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.font = '900 180px Georgia,serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 100, 108);
      const d = x.getImageData(0, 0, 200, 200).data, pts = [];
      for (let y = 0; y < 200; y += 2) for (let xx = 0; xx < 200; xx += 2) if (d[(y * 200 + xx) * 4 + 3] > 128) pts.push([xx, y]);
      return fill(() => { const p = pts[(Math.random() * pts.length) | 0]; return [(p[0] - 100) / 200 * size, -(p[1] - 100) / 200 * size, rnd(-0.35, 0.35)]; });
    }

    const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3), seed = new Float32Array(COUNT);
    pos.set(shapes[0]);
    const palette = [new THREE.Color('#F5C842'), new THREE.Color('#00E5A0'), new THREE.Color('#5AB8FF'), new THREE.Color('#FFE08A')];
    for (let i = 0; i < COUNT; i++) { const c = palette[Math.random() < 0.45 ? 0 : Math.random() < 0.5 ? 1 : Math.random() < 0.6 ? 2 : 3]; col.set([c.r, c.g, c.b], i * 3); seed[i] = Math.random(); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      uniforms: { uT: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uO: { value: 0.75 } },
      vertexShader: `attribute float seed;varying vec3 vC;varying float vA;uniform float uT,uPx;
        void main(){vec3 p=position;p+=0.04*vec3(sin(uT*1.3+seed*40.),cos(uT*1.1+seed*30.),sin(uT*.9+seed*20.));
        vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.6+seed*2.6)*uPx*(9./-mv.z);
        vC=color;vA=.45+.55*sin(uT*2.+seed*60.)*.5+.3;}`,
      fragmentShader: `varying vec3 vC;varying float vA;uniform float uO;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float g=smoothstep(.5,0.,d);gl_FragColor=vec4(vC,g*vA*uO);}`
    });
    const pts = new THREE.Points(geo, mat);
    const group = new THREE.Group(); group.add(pts); scene.add(group);

    // connecting lines for the "neural" feel
    const LN = small ? 160 : 320, lgeo = new THREE.BufferGeometry(), lpos = new Float32Array(LN * 6);
    lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
    const lines = new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({ color: 0x5AB8FF, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }));
    group.add(lines);
    const pairs = Array.from({ length: LN }, () => [(Math.random() * COUNT) | 0, (Math.random() * COUNT) | 0]);

    function size() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    size(); addEventListener('resize', size);

    const clock = new THREE.Clock();
    let gx = 0, gy = 0;
    return (p, mx, my) => {
      const t = clock.getElapsedTime();
      const a = Math.max(0, Math.min(N - 1, p)), i0 = Math.floor(a), i1 = Math.min(N - 1, i0 + 1);
      let f = a - i0; f = f < 0.35 ? 0 : (f - 0.35) / 0.65; f = f * f * (3 - 2 * f);
      const A = shapes[i0], B = shapes[i1];
      for (let i = 0; i < COUNT * 3; i++) { const tgt = A[i] + (B[i] - A[i]) * f; pos[i] += (tgt - pos[i]) * 0.18; }
      geo.attributes.position.needsUpdate = true;
      for (let k = 0; k < LN; k++) { const [u, v] = pairs[k]; lpos.set([pos[u * 3], pos[u * 3 + 1], pos[u * 3 + 2]], k * 6); const d = Math.hypot(pos[u * 3] - pos[v * 3], pos[u * 3 + 1] - pos[v * 3 + 1]); const w = d < 1.4 ? v : u; lpos.set([pos[w * 3], pos[w * 3 + 1], pos[w * 3 + 2]], k * 6 + 3); }
      lgeo.attributes.position.needsUpdate = true;
      gx += (mx - gx) * 0.05; gy += (my - gy) * 0.05;
      group.rotation.y = t * 0.12 + gx * 0.8 + a * 0.35;
      group.rotation.x = gy * 0.4 + Math.sin(t * 0.3) * 0.06;
      // model sits to the side of the text on wide screens, behind on narrow
      const side = small ? 0 : [3.2, 3.6, -3.6, 3.6, 0, 0, -3.4, 0][Math.round(a)] || 0;
      group.position.x += (side - group.position.x) * 0.05;
      group.position.y = small ? 0.6 : 0;
      mat.uniforms.uO.value = small ? 0.45 : [0.8, 0.55, 0.5, 0.5, 0.45, 0.4, 0.5, 0.8][Math.round(a)];
      mat.uniforms.uT.value = t;
      renderer.render(scene, cam);
    };
  }
}

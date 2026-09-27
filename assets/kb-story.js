/* Kongu Brilliance — premium AI story: reveal-on-scroll + WebGL hero (GPU-animated, no scroll hijack) */
const root = document.getElementById('kbs');
if (root) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const secs = root.querySelectorAll('.kx-sec');
  if (reduce || !('IntersectionObserver' in window)) secs.forEach(s => s.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.22 });
    secs.forEach(s => io.observe(s));
  }
  // gentle 3D follow on the UI panels (desktop only, one rAF per move)
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let raf = 0, ex = 0, ey = 0;
    root.addEventListener('pointermove', e => { ex = e.clientX / innerWidth - .5; ey = e.clientY / innerHeight - .5;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; root.style.setProperty('--mx', ex.toFixed(3)); root.style.setProperty('--my', ey.toFixed(3)); }); }, { passive: true });
  }
  if (!reduce) hero3d().catch(() => {});
}

async function hero3d() {
  const canvas = document.getElementById('kbs3d');
  const hero = canvas.parentElement;
  const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
  const small = innerWidth < 820;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  cam.position.set(0, 2.1, 8.5); cam.lookAt(0, -0.4, 0);

  // flowing "knowledge field": a grid of points animated entirely on the GPU
  const W = small ? 110 : 190, H = small ? 60 : 90, pos = new Float32Array(W * H * 3);
  for (let j = 0, k = 0; j < H; j++) for (let i = 0; i < W; i++, k += 3) { pos[k] = (i / (W - 1) - .5) * 22; pos[k + 1] = 0; pos[k + 2] = (j / (H - 1) - .5) * 12; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, px: { value: renderer.getPixelRatio() }, m: { value: new THREE.Vector2() } },
    vertexShader: `uniform float t,px;uniform vec2 m;varying float vH;varying float vZ;
      void main(){vec3 p=position;
        float w=sin(p.x*.45+t*.55)*.55+sin(p.z*.7-t*.4)*.35+sin((p.x+p.z)*.25+t*.3)*.45;
        float d=distance(p.xz,vec2(m.x*9.,m.y*-5.));w+=exp(-d*d*.08)*.9*sin(t*1.5-d);
        p.y=w;vH=w;vec4 mv=modelViewMatrix*vec4(p,1.);vZ=-mv.z;gl_Position=projectionMatrix*mv;
        gl_PointSize=px*(2.2+w*1.1)*(9./vZ);}`,
    fragmentShader: `varying float vH;varying float vZ;
      void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;
        vec3 gold=vec3(.96,.78,.26),teal=vec3(.18,.9,.69),sky=vec3(.42,.72,1.);
        vec3 c=mix(teal,gold,smoothstep(-.4,.9,vH));c=mix(sky,c,smoothstep(4.,9.,vZ));
        float a=smoothstep(.5,0.,d)*(.35+.55*smoothstep(-.8,1.,vH))*smoothstep(18.,6.,vZ);
        gl_FragColor=vec4(c,a);}`
  });
  const pts = new THREE.Points(geo, mat); pts.rotation.y = -0.35; pts.position.set(small ? 0 : 2.4, -1.2, 0); scene.add(pts);

  // soft glowing orb ("the thinking core") floating above the field
  const orbMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 } },
    vertexShader: `varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float t;varying vec3 n;varying vec3 v;void main(){float f=pow(1.-max(dot(n,v),0.),2.2);
      vec3 c=mix(vec3(.96,.78,.26),vec3(.18,.9,.69),.5+.5*sin(t*.6+n.y*3.));gl_FragColor=vec4(c*(f*1.3+.06),f*.9+.05);}` });
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 5), orbMat);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xF5C842, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.55, .006, 8, 160), ringMat);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.95, .005, 8, 160), ringMat.clone()); ring2.material.color.set(0x2EE6B0); ring2.material.opacity = .25;
  const core = new THREE.Group(); core.add(orb, ring1, ring2); core.position.set(small ? 0 : 3.3, small ? 1.9 : 1.2, 0); core.scale.setScalar(small ? .55 : .9); scene.add(core);

  function size() { const w = hero.clientWidth, h = hero.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  size(); addEventListener('resize', size);
  let mx = 0, my = 0, tx = 0, ty = 0, on = true;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  new IntersectionObserver(es => on = es[0].isIntersecting).observe(hero);
  const clock = new THREE.Clock();
  canvas.style.opacity = 0; canvas.style.transition = 'opacity 1.6s ease';
  requestAnimationFrame(() => canvas.style.opacity = 1);
  (function loop() {
    requestAnimationFrame(loop);
    if (!on || document.hidden) { clock.getDelta(); return; }
    const t = clock.getElapsedTime();
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    mat.uniforms.t.value = t; mat.uniforms.m.value.set(mx, my); orbMat.uniforms.t.value = t;
    core.position.y = (small ? 1.9 : 1.2) + Math.sin(t * .8) * .12;
    ring1.rotation.set(1.2 + my * .3, t * .25, 0); ring2.rotation.set(1.4, -t * .18, .4 + mx * .3);
    cam.position.x = mx * .8; cam.position.y = 2.1 - my * .4; cam.lookAt(0, -.4, 0);
    renderer.render(scene, cam);
  })();
}

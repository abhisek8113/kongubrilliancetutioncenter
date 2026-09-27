/* Kongu Brilliance — video-style explainer: auto-plays scene by scene with 3D camera transitions + WebGL particle model */
const root = document.getElementById('kbp');
if (root) init();

function init() {
  const scenes = [...root.querySelectorAll('.sc')], N = scenes.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = scenes.map((_, i) => i === N - 1 ? 9 : 6.8);   // seconds per scene (time to read the caption)
  const TR = 0.9;                                             // transition seconds
  const ch = root.querySelector('.kbp-ch'), pp = root.querySelector('.kbp-pp');
  const bars = scenes.map((s, i) => {
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `<i><b></b></i><span>${s.dataset.t}</span>`; b.onclick = () => go(i); ch.appendChild(b); return b;
  });
  let cur = 0, t = 0, playing = !reduce, prev = -1, tp = 0, visible = true;
  pp.onclick = () => { playing = !playing; snd && snd.pause(!playing); pp.textContent = playing ? '❚❚' : '▶'; pp.setAttribute('aria-label', playing ? 'Pause' : 'Play'); };
  if (!playing) pp.textContent = '▶';
  function go(i) { prev = cur; tp = 0; cur = (i + N) % N; t = 0; if (snd.on) snd.say(scenes[cur].dataset.say); }
  const snd = sound();
  const sb = root.querySelector('.kbp-snd');
  if (sb) sb.onclick = () => {
    snd.toggle();
    sb.classList.toggle('on', snd.on);
    sb.querySelector('.ic').textContent = snd.on ? '🔊' : '🔈';
    sb.querySelector('.tx').textContent = snd.on ? 'Sound on' : 'Tap for sound';
    sb.setAttribute('aria-label', snd.on ? 'Turn sound off' : 'Turn sound on');
    if (snd.on) { playing = true; pp.textContent = '❚❚'; go(cur); }
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = x => 1 - Math.pow(1 - x, 3);
  function render() {
    scenes.forEach((s, i) => {
      let op = 0, z = 0, blur = 0, ry = 0, vis = false;
      if (i === cur) { const k = ease(clamp(t / TR, 0, 1)); op = k; z = (1 - k) * -700; ry = (1 - k) * 10; vis = true;
        s.style.setProperty('--a', reduce ? 1 : ease(clamp((t - .3) / 2.4, 0, 1)).toFixed(3)); }
      else if (i === prev && tp < TR) { const k = ease(tp / TR); op = 1 - k; z = k * 500; blur = k * 8; ry = -k * 8; vis = true; }
      s.style.visibility = vis ? 'visible' : 'hidden';
      s.style.opacity = op.toFixed(3);
      s.style.transform = `translateZ(${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
      s.style.filter = blur > .1 ? `blur(${blur.toFixed(1)}px)` : '';
      s.setAttribute('aria-hidden', i === cur ? 'false' : 'true');
    });
    bars.forEach((b, i) => { b.classList.toggle('on', i === cur); b.firstChild.firstChild.style.width = (i < cur ? 100 : i > cur ? 0 : clamp(t / DUR[i], 0, 1) * 100) + '%'; });
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; snd.away(!visible); }, { threshold: .3 }).observe(root);
  document.addEventListener('visibilitychange', () => snd.away(document.hidden));
  let last = performance.now(), three = null;
  (function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(.1, ((now || performance.now()) - last) / 1000); last = now || performance.now();
    if (!visible || document.hidden) return;
    if (playing) { t += dt; if (t >= DUR[cur] && !(snd.on && snd.speaking())) go(cur + 1); } else if (t < TR + 2.7) t += dt; // finish the current build even when paused
    tp += dt;
    render();
    if (three) three(cur + clamp(t / TR, 0, 1) - 1, now / 1000);
  })();
  render();
  if (!reduce) particles().then(f => three = f).catch(() => {});

  /* ── sound: generated background melody + narrator voice ── */
  function sound() {
    let ctx = null, master, musicGain, timer = 0, on = false, paused = false, away = false, speakingNow = false, voice = null;
    const synth = window.speechSynthesis;
    const pickVoice = () => {
      const vs = synth ? synth.getVoices() : [];
      voice = vs.find(v => /en[-_]IN/i.test(v.lang) && /female|heera|veena|neerja|google/i.test(v.name)) || vs.find(v => /en[-_]IN/i.test(v.lang))
        || vs.find(v => /Google UK English Female|Samantha|Karen|Moira|Serena|Aria|Jenny/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || null;
    };
    if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
    const midi = n => 440 * Math.pow(2, (n - 69) / 12);
    // A minor → F → C → G  (calm, hopeful)
    const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
    const arp = [0, 1, 2, 1, 2, 3, 2, 1];
    const BEAT = 60 / 76 / 2; let step = 0, nextT = 0;
    function reverb() {
      const len = ctx.sampleRate * 2.8, buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      const cv = ctx.createConvolver(); cv.buffer = buf; return cv;
    }
    function note(f, when, dur, type, vol, dest) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(vol, when + .02); g.gain.exponentialRampToValueAtTime(.0001, when + dur);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + dur + .05);
    }
    function pad(ch, when, dur) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.connect(musicGain);
      ch.forEach(n => [-6, 6].forEach(dt => {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = midi(n - 12); o.detune.value = dt;
        g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(.022, when + 1.2); g.gain.linearRampToValueAtTime(0, when + dur + .8);
        o.connect(g); g.connect(f); o.start(when); o.stop(when + dur + 1);
      }));
    }
    function schedule() {
      while (nextT < ctx.currentTime + .25) {
        const bar = Math.floor(step / 16), ch = chords[bar % 4], i = step % 16;
        if (i === 0) { pad(ch, nextT, BEAT * 16); note(midi(ch[0] - 24), nextT, BEAT * 14, 'sine', .16, musicGain); }
        if (i % 2 === 0) { const k = arp[(i / 2) % 8]; const n = k === 3 ? ch[0] + 12 : ch[k] + 12; note(midi(n), nextT, BEAT * 3.2, 'triangle', .07, musicGain); }
        if (i === 6 || i === 14) note(midi(ch[2] + 24), nextT, BEAT * 4, 'sine', .03, musicGain);
        nextT += BEAT; step++;
      }
    }
    function level() {
      if (!ctx) return;
      const target = !on || paused || away ? 0 : speakingNow ? .35 : .8;
      master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(target, ctx.currentTime, .35);
    }
    function start() {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!master) {
        master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
        const comp = ctx.createDynamicsCompressor(); comp.connect(master);
        const rv = reverb(), wet = ctx.createGain(); wet.gain.value = .45; rv.connect(wet); wet.connect(comp);
        musicGain = ctx.createGain(); musicGain.gain.value = .9; musicGain.connect(comp); musicGain.connect(rv);
        nextT = ctx.currentTime + .1;
      }
      ctx.resume(); clearInterval(timer); timer = setInterval(schedule, 100); schedule();
    }
    const api = {
      get on() { return on; },
      speaking: () => speakingNow,
      toggle() { on = !on; if (on) start(); else { synth && synth.cancel(); speakingNow = false; } level(); },
      say(text) {
        if (!synth || !text) return;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-IN';
        u.rate = .96; u.pitch = 1.02; u.volume = 1;
        u.onstart = () => { speakingNow = true; level(); };
        u.onend = u.onerror = () => { speakingNow = false; level(); };
        speakingNow = true; level();
        setTimeout(() => synth.speak(u), 350);
      },
      pause(p) { paused = p; if (synth) p ? synth.pause() : synth.resume(); level(); },
      away(a) { if (a === away) return; away = a; if (a && synth) { synth.cancel(); speakingNow = false; } if (!a && on && !paused) api.say(scenes[cur].dataset.say); level(); }
    };
    return api;
  }

  /* WebGL particle model that re-forms for each scene */
  async function particles() {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    const canvas = root.querySelector('#kbp3d');
    const small = innerWidth < 820, COUNT = small ? 2200 : 4200;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.25 : 1.6));
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, 1, .1, 100); cam.position.z = 10;
    const R = (a, b) => a + Math.random() * (b - a);
    const fill = fn => { const a = new Float32Array(COUNT * 3); for (let i = 0; i < COUNT; i++) a.set(fn(i), i * 3); return a; };
    const sphere = (r, cx = 0) => i => { const k = i + .5, p = Math.acos(1 - 2 * k / COUNT), th = Math.PI * (1 + Math.sqrt(5)) * k; return [cx + r * Math.cos(th) * Math.sin(p), r * Math.cos(p), r * Math.sin(th) * Math.sin(p)]; };
    const shapes = [
      fill(sphere(3.2)),                                                                                   // intro: thinking sphere
      fill(i => { const b = i % 7, h = 1 + b * .7; return [(b - 3) * 1.4 + R(-.4, .4), -3 + R(0, h), R(-.4, .4)]; }),   // gaps: bar chart
      fill(i => { const l = i % 5; return [R(-2, 2) + (l - 2) * .5, R(-2.6, 2.6) + (l - 2) * .25, (l - 2) * .6]; }), // papers
      fill(() => Math.random() < .8 ? [R(-4, 4), R(-2.6, 2.6), R(-.1, .1)] : [R(-4.2, 4.2), R(-2.8, 2.8), R(-.3, .3)]), // tablet
      fill(i => i % 2 ? sphere(1.8, -3.4)(i) : sphere(1.8, 3.4)(i)),                                          // two students
      fill(() => Math.random() < .5 ? [R(-5, 5), R(-.5, 3), -2] : [R(-6, 6), -2.6 + R(-.1, .1), R(-3, 3)]),     // classroom board + floor
      fill(i => { const x = R(-5, 5); return [x, -2.4 + (x + 5) * .5 + R(-.25, .25) + Math.sin(x * 2) * .2, R(-.6, .6)]; }), // rising graph
      fill(i => { if (i % 3 === 0) { const a = R(0, 6.28); return [Math.cos(a) * 4, Math.sin(a) * 4, R(-.1, .1)]; } const u = Math.random(), y = -2.6 + u * 5.2, w = Math.sin(Math.PI * Math.pow(u, .7)) * 1.8 * (1 - u * .35), a = R(0, 6.28), r = Math.sqrt(Math.random()) * w; return [Math.cos(a) * r, y, Math.sin(a) * r * .6]; }) // flame
    ];
    const pos = new Float32Array(shapes[0]), col = new Float32Array(COUNT * 3), seed = new Float32Array(COUNT);
    const pal = [[.96, .78, .27], [.18, .9, .69], [.42, .72, 1]];
    for (let i = 0; i < COUNT; i++) { col.set(pal[Math.random() < .5 ? 0 : Math.random() < .6 ? 1 : 2], i * 3); seed[i] = Math.random(); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      uniforms: { T: { value: 0 }, P: { value: renderer.getPixelRatio() } },
      vertexShader: `attribute float seed;uniform float T,P;varying vec3 c;varying float a;void main(){vec3 p=position+.05*vec3(sin(T+seed*40.),cos(T*1.1+seed*30.),sin(T*.9+seed*20.));vec4 m=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*m;gl_PointSize=(1.4+seed*2.2)*P*(10./-m.z);c=color;a=.35+.4*sin(T*2.+seed*60.)*.5+.25;}`,
      fragmentShader: `varying vec3 c;varying float a;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(c,smoothstep(.5,0.,d)*a*.55);}` });
    const pts = new THREE.Points(g, mat); scene.add(pts);
    const size = () => { const w = root.clientWidth, h = root.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    let mx = 0, my = 0; addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    return (p, time) => {
      const i = Math.round(Math.max(0, p)) % N, tgt = shapes[i];
      for (let k = 0; k < COUNT * 3; k++) pos[k] += (tgt[k] - pos[k]) * .06;
      g.attributes.position.needsUpdate = true;
      pts.rotation.y += ((mx * .6 + time * .08) - pts.rotation.y) * .05 + .0; pts.rotation.x = my * .3;
      mat.uniforms.T.value = time; renderer.render(scene, cam);
    };
  }
}

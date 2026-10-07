// The 3D 24-hour ring (three.js). Hero: your hours are white glass; every hour you're closed lights up as the
// assistant takes over (window.RING.sweep from home.js), glass chat bubbles orbit, events flash their hour.
// Closing section: the same ring fully lit. If WebGL fails, the SVG ring underneath stays visible.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 700px)").matches;
const TAU = Math.PI * 2;
const theta = (h) => Math.PI / 2 - (h / 24) * TAU; // clock hour -> angle in the ring's plane (12 AM at top, clockwise)
// theme colours come from the page (home.css --c1..--c3), deepened a little so they stay rich after lighting
const css = (v, f) => (getComputedStyle(document.documentElement).getPropertyValue(v).trim() || f);
const deepen = (c) => { const k = new THREE.Color(c), h = {}; k.getHSL(h); return k.setHSL(h.h, Math.min(1, h.s * 1.1), h.l > .8 ? h.l : h.l * .88); };
let C1 = css("--c1", "#ffc56b"), C2 = css("--c2", "#ff8a4c"), C3 = css("--c3", "#7ef0c8");
let STOPS = [deepen(C1), deepen(C2), deepen(C3)];
const recolorers = [];
addEventListener("themechange", () => {
  C1 = css("--c1", "#ffc56b"); C2 = css("--c2", "#ff8a4c"); C3 = css("--c3", "#7ef0c8");
  STOPS = [deepen(C1), deepen(C2), deepen(C3)];
  recolorers.forEach((f) => f());
});
const grad = (t) => (t < .5 ? STOPS[0].clone().lerp(STOPS[1], t * 2) : STOPS[1].clone().lerp(STOPS[2], (t - .5) * 2));

// a soft round glow used as an additive sprite (cheap bloom that keeps the canvas transparent)
const glowTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.25, "rgba(255,255,255,.45)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const glow = (color, size, opacity = 0) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(size); return s; };

function mount(host, mode) {
  const R = 1.9, TUBE = .17, hero = mode === "hero";
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.25 : hero ? 1.5 : 1.25));
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const cv = renderer.domElement; cv.className = "gl"; host.prepend(cv);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .4;
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100); camera.position.set(0, 0, hero ? 11 : 8.6);
  scene.add(new THREE.AmbientLight(0xffffff, .25));
  const key = new THREE.DirectionalLight(0xfff1dc, 1.3); key.position.set(3, 4, 6); scene.add(key);
  const warm = new THREE.PointLight(new THREE.Color(C2), 18, 12); warm.position.set(-3, -1.5, 2.5); scene.add(warm);
  const cool = new THREE.PointLight(new THREE.Color(C3), 12, 12); cool.position.set(3.2, 2, 1.5); scene.add(cool);

  const world = new THREE.Group(); scene.add(world);
  const ring = new THREE.Group(); world.add(ring);
  const RG = window.RING || { open: 9, close: 18, now: 23.7, sweep: 1, pulses: [] };
  const OPEN = hero ? RG.open : 0, CLOSE = hero ? RG.close : 0, NCLOSED = 24 - (CLOSE - OPEN);

  // 24 hour segments
  const GAP = .045, segGeo = new THREE.TorusGeometry(R, TUBE, 24, 28, TAU / 24 - GAP);
  const segs = [];
  for (let h = 0; h < 24; h++) {
    const open = h >= OPEN && h < CLOSE, k = (h - CLOSE + 24) % 24, t = hero ? k / (NCLOSED - 1) : (1 - Math.cos((k / 24) * TAU)) / 2, col = open ? new THREE.Color("#f4efe4") : grad(t);
    const mat = new THREE.MeshPhysicalMaterial(open
      ? { color: 0xf4efe4, roughness: .3, metalness: 0, sheen: 1, sheenColor: 0xffffff, clearcoat: 1, clearcoatRoughness: .1, emissive: 0xfff0d8, emissiveIntensity: .08 }
      : { color: 0x1b1e28, roughness: .35, metalness: .1, clearcoat: .5, clearcoatRoughness: .2, emissive: col, emissiveIntensity: 0 });
    const m = new THREE.Mesh(segGeo, mat); m.rotation.z = theta(h + 1) + GAP / 2; ring.add(m);
    const mid = theta(h + .5), g = glow(col, open ? .9 : 1.5, open ? .03 : 0); g.position.set(Math.cos(mid) * R, Math.sin(mid) * R, .05); ring.add(g);
    segs.push({ h, open, k, t, mat, g, col, flash: 0 });
  }
  // hour ticks + a glass lens in the middle
  const tickGeo = new THREE.BoxGeometry(.03, .12, .03), tickMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: .25, roughness: .4 });
  for (let h = 0; h < 24; h++) { const t = new THREE.Mesh(tickGeo, tickMat), a = theta(h), r = R + .38; t.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); t.rotation.z = a - Math.PI / 2; if (h % 6 === 0) t.scale.set(1.4, 2, 1.4); ring.add(t); }
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(R - .42, R - .42, .08, 96), new THREE.MeshPhysicalMaterial({ color: 0x9aa3b8, roughness: .1, metalness: .2, clearcoat: 1, transparent: true, opacity: .14, depthWrite: false }));
  lens.rotation.x = Math.PI / 2; lens.position.z = -.12; if (hero) ring.add(lens);
  const core = glow(new THREE.Color(C1), hero ? 3.6 : 4.4, hero ? .08 : .14); core.position.z = -.2; ring.add(core);

  // the "now" orb
  let needle = null;
  if (hero) {
    const a = theta(RG.now);
    needle = new THREE.Mesh(new THREE.SphereGeometry(.13, 32, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2 }));
    needle.position.set(Math.cos(a) * R, Math.sin(a) * R, TUBE + .1); ring.add(needle);
    const ng = glow(0xffffff, .9, .7); needle.add(ng);
  }

  // glass chat bubbles orbiting the ring
  const bubbles = [];
  if (hero) {
    const bGeo = new RoundedBoxGeometry(.95, .62, .2, 6, .24), tail = new THREE.ConeGeometry(.1, .2, 16), dotGeo = new THREE.SphereGeometry(.055, 16, 8);
    [[C1, -1], [C3, 1], ["#f4efe4", -1], [C2, 1]].slice(0, small ? 3 : 4).forEach(([c, side], i) => {
      const g = new THREE.Group(); g.userData.ci = [1, 3, 0, 2][i];
      const mat = new THREE.MeshPhysicalMaterial({ color: c, roughness: .18, metalness: 0, clearcoat: 1, clearcoatRoughness: .1, emissive: c, emissiveIntensity: .22 });
      const b = new THREE.Mesh(bGeo, mat); g.add(b);
      const t = new THREE.Mesh(tail, mat); t.position.set(side * .3, -.38, 0); t.rotation.z = side * .5 + Math.PI; g.add(t);
      for (let d = -1; d <= 1; d++) { const dot = new THREE.Mesh(dotGeo, new THREE.MeshStandardMaterial({ color: 0x0b0c10, emissive: c, emissiveIntensity: .0, roughness: .3 })); dot.position.set(d * .2, 0, .11); dot.userData.d = d; g.add(dot); }
      const gl = glow(c, 1.6, .18); gl.position.z = -.15; g.add(gl);
      Object.assign(g.userData, { a: i * (TAU / 4) + .6, r: R + (i % 2 ? 1 : .8), z: i % 2 ? .9 : -.5, speed: .09 + i * .015, bob: i * 1.3 });
      g.scale.setScalar(small ? .8 : .9); world.add(g); bubbles.push(g);
    });
  }
  // light dust
  const N = small ? 160 : 320, pos = new Float32Array(N * 3), colr = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const r = R + .5 + Math.random() * 2.6, a = Math.random() * TAU, z = (Math.random() - .5) * 2.4; pos.set([Math.cos(a) * r, Math.sin(a) * r, z], i * 3); const c = grad(Math.random()); colr.set([c.r, c.g, c.b], i * 3); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); dg.setAttribute("color", new THREE.BufferAttribute(colr, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: .035, vertexColors: true, transparent: true, opacity: .7, blending: THREE.AdditiveBlending, depthWrite: false, map: glowTex }));
  world.add(dust);

  // event ripples
  const ripples = [], ripGeo = new THREE.TorusGeometry(.16, .01, 8, 48);
  let seen = 0;
  const ripple = (h) => {
    const a = theta(h), s = segs[Math.floor(h) % 24], m = new THREE.Mesh(ripGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(C3), toneMapped: false, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(Math.cos(a) * R, Math.sin(a) * R, TUBE); ring.add(m); ripples.push({ m, t: 0 }); s.flash = 1;
  };

  // pointer, drag and scroll
  let tx = 0, ty = 0, rx = 0, ry = 0, spin = 0, vel = 0, drag = null;
  const baseX = hero ? -.38 : -.5, baseY = hero ? .28 : 0;
  addEventListener("pointermove", (e) => { tx = (e.clientY / innerHeight - .5) * .35; ty = (e.clientX / innerWidth - .5) * .5; if (drag !== null) { vel = (e.clientX - drag) * .006; drag = e.clientX; } }, { passive: true });
  cv.addEventListener("pointerdown", (e) => { drag = e.clientX; cv.style.cursor = "grabbing"; });
  addEventListener("pointerup", () => { drag = null; cv.style.cursor = ""; });

  const resize = () => { const r = cv.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); resize();

  let visible = true, raf = 0, last = performance.now(), t = 0, first = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }, { rootMargin: "100px" }).observe(host);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });

  function frame(now) {
    raf = 0; const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt;
    const sweep = hero ? RG.sweep : 1;
    // segments light up one by one after closing time
    for (const s of segs) {
      if (s.open) continue;
      const on = Math.min(1, Math.max(0, sweep * NCLOSED - s.k)), pulse = hero ? 0 : (Math.sin(t * 2 - s.h * .5) * .5 + .5) * .35;
      s.flash = Math.max(0, s.flash - dt * 1.2);
      s.mat.emissiveIntensity = on * ((hero ? .7 : .5) + pulse) + s.flash * 1.2;
      s.mat.color.set(0x1b1e28).lerp(s.col, on);
      s.g.material.opacity = on * ((hero ? .42 : .2) + pulse * .4) + s.flash * .5;
      if (s.flash > 0) s.g.material.color.copy(s.col).lerp(STOPS[2], s.flash); else s.g.material.color.copy(s.col);
    }
    if (hero && RG.pulses.length > seen) { while (seen < RG.pulses.length) ripple(RG.pulses[seen++].h); }
    for (let i = ripples.length - 1; i >= 0; i--) { const r = ripples[i]; r.t += dt; r.m.scale.setScalar(1 + r.t * 4); r.m.material.opacity = Math.max(0, .9 - r.t / 1.1); if (r.t > 1) { ring.remove(r.m); r.m.material.dispose(); ripples.splice(i, 1); } }
    if (needle) { const k = 1 + Math.sin(t * 3) * .12; needle.scale.setScalar(k); }
    bubbles.forEach((g, i) => {
      const u = g.userData, a = u.a + t * u.speed;
      g.position.set(Math.cos(a) * u.r, Math.sin(a) * u.r * .92 + Math.sin(t * 1.3 + u.bob) * .12, u.z + Math.sin(t * .8 + i) * .25);
      g.rotation.set(Math.sin(t * .7 + i) * .25, Math.sin(t * .5 + i * 2) * .35 - ry * .5, Math.sin(t * .6 + i) * .12);
      g.children.forEach((c) => { if (c.userData.d !== undefined) { const p = Math.sin(t * 6 - c.userData.d * 1.2) * .5 + .5; c.position.z = .11 + p * .03; c.material.emissiveIntensity = p * 1.6; } });
    });
    dust.rotation.z = t * .02; dust.rotation.y = Math.sin(t * .1) * .1;
    // gentle float, follow the pointer, spin when dragged
    if (drag === null) vel *= .94; spin += vel;
    if (!hero) spin += dt * .25;
    rx += (baseX + tx - rx) * .05; ry += (baseY + ty - ry) * .05;
    world.rotation.x = rx + Math.sin(t * .5) * .04; world.rotation.y = ry + spin + Math.sin(t * .35) * .06;
    renderer.render(scene, camera);
    if (first) { first = false; host.classList.add("gl-on"); setTimeout(() => host.querySelector("svg.ring")?.remove(), 700); }
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  // a visitor picked another colour theme: repaint everything that carries a theme colour
  recolorers.push(() => {
    segs.forEach((s) => { if (!s.open) { s.col = grad(s.t); s.mat.emissive.copy(s.col); } });
    warm.color.set(C2); cool.color.set(C3); core.material.color.set(C1);
    bubbles.forEach((b) => { const ci = b.userData.ci; if (!ci) return; const c = new THREE.Color([0, C1, C2, C3][ci]);
      b.children.forEach((m) => { if (m.isSprite) m.material.color.copy(c); else if (m.userData.d !== undefined) m.material.emissive.copy(c); else { m.material.color.copy(c); m.material.emissive.copy(c); } }); });
    if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  raf = requestAnimationFrame(frame);
}

function safeMount(el, mode) { try { mount(el, mode); } catch (e) { console.warn("3D ring off:", e); } }
const heroEl = document.querySelector(".ring-wrap"), haloEl = document.querySelector(".halo");
const hasGL = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
if (hasGL && !document.documentElement.classList.contains("embed")) {
  if (heroEl) safeMount(heroEl, "hero");
  // the closing ring is 3D only on computers; phones keep the light CSS ring (building a 2nd 3D scene froze phones for ~1 s)
  if (haloEl && matchMedia("(min-width: 900px) and (hover: hover)").matches) { const go = () => safeMount(haloEl, "halo"); addEventListener("load", () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 2500))); }
}

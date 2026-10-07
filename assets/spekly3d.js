// Spekly hero in 3D: a gold microphone sends out sound rings, a 3D invoice floats beside it, gold coins orbit.
// Follows the pointer; drag to spin. Falls back to the flat gold icon without WebGL.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const host = document.getElementById("stage3d");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, small = matchMedia("(max-width: 700px)").matches;
const GOLD = new THREE.Color("#d9a94e"), HI = new THREE.Color("#f0c874");

function invoiceTexture() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 680; const g = c.getContext("2d");
  g.fillStyle = "#1e1911"; g.fillRect(0, 0, 512, 680);
  g.fillStyle = "#9b968d"; g.font = "600 26px Space Grotesk, sans-serif"; g.fillText("INVOICE #0142", 40, 70); g.textAlign = "right"; g.fillText("VAT 5%", 472, 70); g.textAlign = "left";
  const row = (y, a, b, col = "#f5f2ec") => { g.fillStyle = col; g.font = "500 32px Inter, sans-serif"; g.fillText(a, 40, y); g.textAlign = "right"; g.fillText(b, 472, y); g.textAlign = "left"; g.strokeStyle = "rgba(217,169,78,.35)"; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(40, y + 26); g.lineTo(472, y + 26); g.stroke(); };
  row(160, "Tyre × 2", "400.00"); row(240, "VAT 5%", "20.00"); row(320, "Paid, cash", "200.00");
  g.setLineDash([]); g.fillStyle = "#9b968d"; g.font = "500 28px Inter, sans-serif"; g.fillText("Total AED", 40, 440);
  g.fillStyle = "#f0c874"; g.font = "700 64px Space Grotesk, sans-serif"; g.textAlign = "right"; g.fillText("420.00", 472, 450); g.textAlign = "left";
  g.fillStyle = "rgba(239,138,124,.14)"; g.beginPath(); g.roundRect(40, 500, 432, 100, 20); g.fill();
  g.fillStyle = "#ef8a7c"; g.font = "500 26px Inter, sans-serif"; g.fillText("Still owes", 66, 560); g.font = "700 40px Space Grotesk, sans-serif"; g.textAlign = "right"; g.fillText("220", 446, 566);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function mount() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.25 : 1.5)); renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const cv = renderer.domElement; host.prepend(cv);
  const scene = new THREE.Scene(), pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .9;
  const cam = new THREE.PerspectiveCamera(32, 1, .1, 100); cam.position.set(0, 0, 10);
  scene.add(new THREE.AmbientLight(0xffffff, .3));
  const key = new THREE.DirectionalLight(0xfff0d0, 2.2); key.position.set(3, 5, 6); scene.add(key);
  const rim = new THREE.PointLight(0xf0c874, 30, 14); rim.position.set(-3, 1, -2); scene.add(rim);

  const world = new THREE.Group(); scene.add(world);
  const gold = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: .22, clearcoat: .6, clearcoatRoughness: .2 });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x17171a, metalness: .4, roughness: .35, clearcoat: 1 });

  // microphone: grille head, gold collar, handle
  const mic = new THREE.Group(); world.add(mic);
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(.62, .7, 16, 40), new THREE.MeshPhysicalMaterial({ color: 0x2a2620, metalness: .9, roughness: .45 }));
  head.position.y = .55; mic.add(head);
  for (let i = -3; i <= 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.635 * Math.cos(Math.min(1.2, Math.abs(i) * .0)) , .022, 8, 64), gold); r.rotation.x = Math.PI / 2; r.position.y = .55 + i * .14; mic.add(r); }
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.5, .42, .36, 48), gold); collar.position.y = -.42; mic.add(collar);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.3, .24, 1.3, 40), dark); handle.position.y = -1.2; mic.add(handle);
  const cap = new THREE.Mesh(new THREE.TorusGeometry(.27, .05, 12, 40), gold); cap.rotation.x = Math.PI / 2; cap.position.y = -1.85; mic.add(cap);
  const led = new THREE.Mesh(new THREE.SphereGeometry(.06, 16, 8), new THREE.MeshBasicMaterial({ color: 0xff5a4f })); led.position.set(0, -.9, .3); mic.add(led);
  mic.rotation.z = -.18; mic.position.set(-.6, .1, 0);

  // sound rings leaving the mic
  const rings = []; const ringGeo = new THREE.TorusGeometry(1, .012, 8, 96);
  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: HI, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.position.copy(mic.position).add(new THREE.Vector3(0, .55, 0)); world.add(m); rings.push({ m, o: i / 4 }); }

  // floating invoice
  const inv = new THREE.Group(); world.add(inv);
  const paper = new THREE.Mesh(new RoundedBoxGeometry(1.9, 2.5, .06, 4, .08), [dark, dark, dark, dark, new THREE.MeshStandardMaterial({ map: invoiceTexture(), roughness: .6, metalness: 0 }), dark]);
  inv.add(paper); const edge = new THREE.Mesh(new RoundedBoxGeometry(1.96, 2.56, .04, 4, .09), new THREE.MeshPhysicalMaterial({ color: 0x3d3222, metalness: .6, roughness: .3 })); edge.position.z = -.03; inv.add(edge);
  inv.position.set(1.75, -.1, .4); inv.rotation.set(.05, -.45, .06);

  // coins
  const coins = []; const coinGeo = new THREE.CylinderGeometry(.26, .26, .06, 40);
  for (let i = 0; i < (small ? 4 : 6); i++) { const c = new THREE.Mesh(coinGeo, gold); c.userData = { a: (i / 6) * Math.PI * 2, r: 2.3 + (i % 2) * .4, y: (i % 3 - 1) * .9, s: .25 + i * .03 }; world.add(c); coins.push(c); }
  // gold dust
  const N = small ? 120 : 240, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) pos.set([(Math.random() - .5) * 8, (Math.random() - .5) * 6, (Math.random() - .5) * 4], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: HI, size: .025, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending })); world.add(dust);

  let tx = 0, ty = 0, rx = 0, ry = 0, spin = 0, vel = 0, drag = null;
  addEventListener("pointermove", (e) => { tx = (e.clientY / innerHeight - .5) * .3; ty = (e.clientX / innerWidth - .5) * .5; if (drag !== null) { vel = (e.clientX - drag) * .006; drag = e.clientX; } }, { passive: true });
  cv.addEventListener("pointerdown", (e) => (drag = e.clientX)); addEventListener("pointerup", () => (drag = null));
  const resize = () => { const r = cv.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); resize();
  let visible = true, raf = 0, t = 0, last = performance.now(), first = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }).observe(host);
  function frame(now) {
    raf = 0; const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt;
    rings.forEach((r) => { const k = (t * .45 + r.o) % 1; r.m.scale.setScalar(.8 + k * 2.6); r.m.material.opacity = (1 - k) * .55; r.m.rotation.set(Math.PI / 2 * .15, .5, 0); });
    led.material.color.setHSL(.01, 1, .45 + Math.sin(t * 6) * .15);
    mic.position.y = .1 + Math.sin(t * 1.1) * .08; mic.rotation.y = Math.sin(t * .5) * .3;
    inv.position.y = -.1 + Math.sin(t * .9 + 1) * .12; inv.rotation.y = -.45 + Math.sin(t * .6) * .12;
    coins.forEach((c) => { const u = c.userData, a = u.a + t * u.s; c.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.a) * .15, Math.sin(a) * u.r * .5); c.rotation.set(t * 1.4 + u.a, t + u.a, .3); });
    dust.rotation.y = t * .03;
    if (drag === null) vel *= .94; spin += vel;
    rx += (tx - rx) * .05; ry += (ty - ry) * .05; world.rotation.x = rx; world.rotation.y = ry + spin;
    renderer.render(scene, cam);
    if (first) { first = false; host.classList.add("gl-on"); }
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });
  raf = requestAnimationFrame(frame);
}
try { const c = document.createElement("canvas"); if (host && (c.getContext("webgl2") || c.getContext("webgl"))) document.fonts.ready.then(mount); } catch (e) { console.warn("3D off:", e); }

window.__main = function () {
const MIDCENTURY = "https://claude.ai/artifact/3FeoRTpUdNkBY6xcQwF9Jr";
/* Projects, case studies and page templates live in public/content.js (shared with the list view at /list). */
const { PROJECTS, DETAILS, ASSETS, isShipped, alloraSketch, wireAlloraSketch, media, wireDots, esc, whatIf, caseFor, sheetHTML, aboutHTML, wireAbout } = window.SITE;

if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const C = c => new THREE.Color(c);

/* ---------- Renderer, scene, camera ---------- */
const canvas = document.getElementById("gl");
const viewport = canvas.parentElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;

const scene = new THREE.Scene();
const HORIZON = "#F3D9B8";
scene.background = C(HORIZON);
scene.fog = new THREE.Fog(HORIZON, 30, 95);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
const HOME = { pos: new THREE.Vector3(11.5, 9.5, 15.5), target: new THREE.Vector3(0, 0.4, -0.2) };
const MOBILE = innerWidth <= 860;
if (MOBILE) { HOME.pos.set(0.4, 21, 23.5); HOME.target.set(-0.35, 0, 0); } // looks down the front-to-back column of objects
camera.position.copy(HOME.pos);

const controls = new THREE.OrbitControls(camera, canvas);
controls.target.copy(HOME.target);
controls.enableDamping = !reduceMotion;
controls.dampingFactor = 0.09;
controls.minDistance = 2.5;
controls.maxDistance = 32;
controls.maxPolarAngle = Math.PI * 0.43;
// map-style: primary drag pans across the meadow, secondary (two-finger click / right drag) orbits
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.screenSpacePanning = false;
controls.update();

// soft studio reflections for the satin paint
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
const hemi = new THREE.HemisphereLight("#CFE0F2", "#6E7A4E", 0.55); scene.add(hemi);
const sun = new THREE.DirectionalLight("#FFE1B5", 1.3);
sun.position.set(12, 11, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
sun.shadow.radius = 4;
scene.add(sun);
const fill = new THREE.DirectionalLight("#B9C8FF", 0.3);
fill.position.set(-8, 5, -6);
scene.add(fill);

// Landscape: a flat meadow in the middle, rolling hills around it, trees, a sky dome
const floor = new THREE.Group(), grid = new THREE.Group(), fine = new THREE.Group(); // kept for older view toggles
let terrainY = () => 0, skyMat;
(function landscape() {
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hill = (x, z) => {
    const r = Math.hypot(x, z * 1.15), k = THREE.MathUtils.smoothstep(r, 12, 26);
    const n = Math.sin(x * 0.11 + 1.3) * Math.cos(z * 0.09) * 3.2 + Math.sin(x * 0.23 + z * 0.17) * 1.4 + Math.cos(z * 0.31 - x * 0.07) * 0.7;
    return k * (2.2 + n + (r - 12) * 0.12) + (1 - k) * (Math.sin(x * 0.4) * Math.cos(z * 0.35) * 0.06);
  };
  terrainY = hill;
  const geo = new THREE.PlaneGeometry(200, 200, 110, 110).toNonIndexed();
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cols = [];
  const meadow = C("#8DA65A"), gold = C("#B9A960"), deep = C("#5E7B45"), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, hill(x, z)); }
  for (let i = 0; i < pos.count; i += 3) {
    const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3, cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    const g2 = 0.5 + 0.5 * Math.sin(cx * 0.07 + cz * 0.05);
    tmp.copy(meadow).lerp(gold, g2 * 0.55).lerp(deep, THREE.MathUtils.clamp(y / 9, 0, 1) * 0.7);
    tmp.offsetHSL(0, 0, (rnd() - 0.5) * 0.025);
    for (let k = 0; k < 3; k++) cols.push(tmp.r, tmp.g, tmp.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, envMapIntensity: 0.2 }));
  ground.receiveShadow = true; ground.userData.isGround = true;
  scene.add(ground);
  // low-poly trees in clumps on the slopes
  const cone = new THREE.ConeGeometry(0.7, 2.0, 6), trunk = new THREE.CylinderGeometry(0.1, 0.13, 0.5, 5);
  const N = 260, crowns = new THREE.InstancedMesh(cone, new THREE.MeshStandardMaterial({ color: C("#4F7346"), flatShading: true, roughness: 0.9 }), N);
  const trunks = new THREE.InstancedMesh(trunk, new THREE.MeshStandardMaterial({ color: C("#7A5A3E"), flatShading: true, roughness: 0.9 }), N);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p3 = new THREE.Vector3();
  let n = 0;
  for (let c = 0; c < 26 && n < N; c++) {
    const ang = rnd() * Math.PI * 2, rad = 15 + rnd() * 30, cx = Math.cos(ang) * rad, cz = Math.sin(ang) * rad * 0.9;
    const count = 5 + Math.floor(rnd() * 9);
    for (let t = 0; t < count && n < N; t++) {
      const x = cx + (rnd() - 0.5) * 7, z = cz + (rnd() - 0.5) * 7, y = hill(x, z), s2 = 0.7 + rnd() * 0.9;
      if (Math.hypot(x, z) < 12.5) continue;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6);
      m4.compose(p3.set(x, y + 0.25 * s2, z), q, sc.set(s2, s2, s2)); trunks.setMatrixAt(n, m4);
      m4.compose(p3.set(x, y + (0.5 + 1.0) * s2, z), q, sc.set(s2, s2 * (0.9 + rnd() * 0.5), s2)); crowns.setMatrixAt(n, m4);
      n++;
    }
  }
  crowns.count = trunks.count = n; crowns.castShadow = trunks.castShadow = true;
  scene.add(crowns, trunks);
  // a few rocks near the meadow's edge
  const rockG = new THREE.DodecahedronGeometry(0.5, 0), rockM = new THREE.MeshStandardMaterial({ color: C("#B7B2A4"), flatShading: true, roughness: 0.9 });
  for (let i = 0; i < 18; i++) {
    const ang = rnd() * Math.PI * 2, rad = 11 + rnd() * 8, x = Math.cos(ang) * rad, z = Math.sin(ang) * rad;
    const r2 = new THREE.Mesh(rockG, rockM); const s3 = 0.4 + rnd() * 0.9;
    r2.position.set(x, hill(x, z) + 0.1, z); r2.scale.set(s3, s3 * 0.7, s3); r2.rotation.set(rnd(), rnd() * 6, rnd());
    r2.castShadow = r2.receiveShadow = true; scene.add(r2);
  }
  // sky dome: soft blue overhead fading to a warm horizon
  skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C("#8FB6D9") }, mid: { value: C("#CFE0EC") }, bottom: { value: C(HORIZON) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 bottom; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.18 ? mix(mid, top, smoothstep(0.18, 0.75, h)) : mix(bottom, mid, smoothstep(-0.02, 0.18, h)); gl_FragColor = vec4(c, 1.0); }"
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), skyMat));
})();

/* ---------- Time-of-day environment ---------- */
// Each keyframe: hour (0-24), sun XY position, sun color/intensity, hemisphere sky/ground colors,
// sky dome top/mid/bottom colors, fog color/near/far, star opacity, moon opacity/light intensity.
const ENV_KEYS = [
  { h:  0, sx: -6, sy:-16, sc:'#1E2460', si:0.00, hk:'#070A1A', hg:'#040608', st:'#02050E', sm:'#070B1E', sb:'#111640', fc:'#0A0E28', fn:18, ff:55, so:0.95, mo:0.90, mi:0.30 },
  { h:  4, sx: -6, sy:-12, sc:'#1E2460', si:0.00, hk:'#070A1A', hg:'#040608', st:'#02050E', sm:'#070B1E', sb:'#111640', fc:'#0A0E28', fn:18, ff:55, so:0.95, mo:0.90, mi:0.30 },
  { h:  5, sx:-18, sy:  0, sc:'#FF3C10', si:0.08, hk:'#1A1240', hg:'#100A08', st:'#160A30', sm:'#381550', sb:'#5A2858', fc:'#5A2858', fn:20, ff:60, so:0.75, mo:0.55, mi:0.08 },
  { h:  6, sx:-18, sy:  2, sc:'#FF6818', si:0.50, hk:'#784468', hg:'#3A1E0E', st:'#38186A', sm:'#C85E38', sb:'#F4A030', fc:'#F09040', fn:24, ff:72, so:0.15, mo:0.05, mi:0.00 },
  { h:  7, sx:-14, sy:  8, sc:'#FFA048', si:1.00, hk:'#A88070', hg:'#4A3018', st:'#605070', sm:'#C0A070', sb:'#F5C070', fc:'#F5B858', fn:27, ff:84, so:0.00, mo:0.00, mi:0.00 },
  { h:  9, sx:-10, sy: 13, sc:'#FFE1B5', si:1.30, hk:'#CFE0F2', hg:'#6E7A4E', st:'#8FB6D9', sm:'#CFE0EC', sb:'#F3D9B8', fc:'#F3D9B8', fn:30, ff:95, so:0.00, mo:0.00, mi:0.00 },
  { h: 12, sx:  0, sy: 20, sc:'#FFF8F0', si:1.55, hk:'#B8D8F4', hg:'#7A8A50', st:'#5A9ED8', sm:'#B8D6F0', sb:'#F5EAD0', fc:'#F5EAD0', fn:32, ff:100, so:0.00, mo:0.00, mi:0.00 },
  { h: 15, sx: 10, sy: 14, sc:'#FFD090', si:1.30, hk:'#C8C0D8', hg:'#706838', st:'#6AA0C8', sm:'#D8C090', sb:'#F5D080', fc:'#F5D080', fn:30, ff:90, so:0.00, mo:0.00, mi:0.00 },
  { h: 17, sx: 15, sy:  7, sc:'#FF8C38', si:1.00, hk:'#BC8C68', hg:'#3C1C0A', st:'#623850', sm:'#CC4428', sb:'#F58830', fc:'#F07838', fn:27, ff:80, so:0.00, mo:0.00, mi:0.00 },
  { h: 19, sx: 17, sy:  1, sc:'#FF4018', si:0.45, hk:'#783050', hg:'#2A1408', st:'#360850', sm:'#B82A20', sb:'#F05828', fc:'#D84A28', fn:24, ff:68, so:0.20, mo:0.12, mi:0.00 },
  { h: 20, sx: 13, sy: -3, sc:'#C01008', si:0.06, hk:'#361448', hg:'#160A14', st:'#180838', sm:'#301440', sb:'#4A2250', fc:'#422060', fn:20, ff:62, so:0.65, mo:0.60, mi:0.18 },
  { h: 22, sx: -6, sy:-16, sc:'#1E2460', si:0.00, hk:'#070A1A', hg:'#040608', st:'#02050E', sm:'#070B1E', sb:'#111640', fc:'#0A0E28', fn:18, ff:55, so:0.95, mo:0.90, mi:0.30 },
  { h: 24, sx: -6, sy:-16, sc:'#1E2460', si:0.00, hk:'#070A1A', hg:'#040608', st:'#02050E', sm:'#070B1E', sb:'#111640', fc:'#0A0E28', fn:18, ff:55, so:0.95, mo:0.90, mi:0.30 },
];
function getEnvAt(hour) {
  let lo = ENV_KEYS[0], hi = ENV_KEYS[ENV_KEYS.length - 1];
  for (let i = 0; i < ENV_KEYS.length - 1; i++) {
    if (ENV_KEYS[i].h <= hour && ENV_KEYS[i + 1].h >= hour) { lo = ENV_KEYS[i]; hi = ENV_KEYS[i + 1]; break; }
  }
  const t = lo.h === hi.h ? 0 : (hour - lo.h) / (hi.h - lo.h);
  const n = (a, b) => a + (b - a) * t;
  const lc = (a, b) => new THREE.Color(a).lerp(new THREE.Color(b), t);
  return {
    sunPos: new THREE.Vector3(n(lo.sx, hi.sx), n(lo.sy, hi.sy), 8),
    sunColor: lc(lo.sc, hi.sc), sunInt: n(lo.si, hi.si),
    hSky: lc(lo.hk, hi.hk), hGnd: lc(lo.hg, hi.hg),
    skyTop: lc(lo.st, hi.st), skyMid: lc(lo.sm, hi.sm), skyBot: lc(lo.sb, hi.sb),
    fogColor: lc(lo.fc, hi.fc), fogNear: n(lo.fn, hi.fn), fogFar: n(lo.ff, hi.ff),
    starOp: n(lo.so, hi.so), moonOp: n(lo.mo, hi.mo), moonInt: n(lo.mi, hi.mi),
  };
}

// Star field — 1 800 points on the inside of the sky sphere
{ const N = 1800, pos = new Float32Array(N * 3); let sd = 11;
  const rr = () => { sd = (sd * 1664525 + 1013904223) | 0; return (sd >>> 0) / 0xffffffff; };
  for (let i = 0; i < N; i++) {
    const theta = Math.acos(2 * rr() - 1), phi = rr() * Math.PI * 2, r = 144;
    pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    pos[i * 3 + 1] = r * Math.cos(theta);
    pos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var starMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1.5, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: false, fog: false });
  var starField = new THREE.Points(geo, starMat);
  starField.renderOrder = 1;
  scene.add(starField); }


let envTarget = null, envBooted = false, lastEnvSample = -Infinity;
function applyEnv(alpha) {
  if (!envTarget) return;
  const a = alpha;
  sun.position.lerp(envTarget.sunPos, a);
  sun.color.lerp(envTarget.sunColor, a);
  sun.intensity += (envTarget.sunInt - sun.intensity) * a;
  hemi.color.lerp(envTarget.hSky, a);
  hemi.groundColor.lerp(envTarget.hGnd, a);
  if (skyMat) {
    skyMat.uniforms.top.value.lerp(envTarget.skyTop, a);
    skyMat.uniforms.mid.value.lerp(envTarget.skyMid, a);
    skyMat.uniforms.bottom.value.lerp(envTarget.skyBot, a);
  }
  scene.fog.color.lerp(envTarget.fogColor, a);
  scene.fog.near += (envTarget.fogNear - scene.fog.near) * a;
  scene.fog.far += (envTarget.fogFar - scene.fog.far) * a;
  scene.background.lerp(envTarget.fogColor, a);
  starMat.opacity += (envTarget.starOp - starMat.opacity) * a;
  // Keep the mobile project strip in harmony with the sky.
  // Reads scene.fog.color (the current lerped value) so it tracks the transition every frame.
  const sc = scene.fog.color;
  const sr = Math.round(sc.r * 255), sg = Math.round(sc.g * 255), sb = Math.round(sc.b * 255);
  const lum = sc.r * 0.299 + sc.g * 0.587 + sc.b * 0.114;
  const t = Math.max(0, Math.min(1, (lum - 0.06) / 0.22)); // 0 = midnight, 1 = full daylight
  const root = document.documentElement;
  root.style.setProperty('--ms-strip-end', `rgba(${sr},${sg},${sb},0.88)`);
  root.style.setProperty('--ms-strip-rgb', `${sr}, ${sg}, ${sb}`);
  // Button surface: fog color nudged ~10 % toward white to read as frosted glass
  const mix = 0.1 + t * 0.05;
  const br = Math.round(sr + (255 - sr) * mix);
  const bg2 = Math.round(sg + (255 - sg) * mix);
  const bb = Math.round(sb + (255 - sb) * mix);
  root.style.setProperty('--ms-btn-bg', `rgba(${br},${bg2},${bb},${(0.78 + t * 0.14).toFixed(2)})`);
  // Text and chrome flip at btnLum 0.35 (between dark and light surfaces)
  if ((br * 0.299 + bg2 * 0.587 + bb * 0.114) / 255 < 0.35) {
    root.style.setProperty('--ms-text', 'rgba(210,220,248,0.95)');
    root.style.setProperty('--ms-btn-border', 'rgba(140,165,255,0.25)');
    root.style.setProperty('--ms-dot-ring', 'rgba(170,195,255,0.45)');
    root.style.setProperty('--ms-btn-shadow', '0 2px 12px -4px rgba(0,4,25,0.5)');
    root.style.setProperty('--ms-btn-border-hover', 'rgba(170,195,255,0.5)');
    root.style.setProperty('--ms-btn-shadow-hover', '0 10px 24px -8px rgba(0,4,25,0.7)');
    // Controls card: solid night surface tinted from the fog
    root.style.setProperty('--ch-night-bg', `rgb(${Math.round(sr + (255 - sr) * 0.08)},${Math.round(sg + (255 - sg) * 0.08)},${Math.round(sb + (255 - sb) * 0.1)})`);
    if (root.dataset.env !== 'night') root.dataset.env = 'night';
  } else {
    if (root.dataset.env !== 'day') root.dataset.env = 'day';
    root.style.setProperty('--ms-text', '#2F3A27');
    root.style.setProperty('--ms-btn-border', 'rgba(255,255,255,0.72)');
    root.style.setProperty('--ms-dot-ring', 'rgba(74,50,33,0.28)');
    root.style.setProperty('--ms-btn-shadow', '0 2px 10px -4px rgba(47,58,39,0.22)');
    root.style.setProperty('--ms-btn-border-hover', 'rgba(255,255,255,0.95)');
    root.style.setProperty('--ms-btn-shadow-hover', '0 8px 20px -8px rgba(47,58,39,0.35)');
  }
}

/* ---------- Modeling helpers: wooden designer-toy language ---------- */
const mats = {};
function mat(color, rough = 0.6, metal = 0, extra = {}) {
  const key = ["s", color, rough, metal, JSON.stringify(extra)].join("|");
  if (!mats[key]) mats[key] = new THREE.MeshStandardMaterial(Object.assign({ color: C(color), roughness: rough, metalness: metal }, extra));
  return mats[key];
}
// satin, clear-coated paint
function paint(color, extra = {}) {
  const key = ["p", color, JSON.stringify(extra)].join("|");
  if (!mats[key]) mats[key] = new THREE.MeshPhysicalMaterial(Object.assign({ color: C(color), roughness: 0.34, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.25, envMapIntensity: 0.45 }, extra));
  return mats[key];
}
// natural beech with a drawn grain
const woodTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#E6CCA4"; x.fillRect(0, 0, 256, 256);
  let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 80; i++) {
    x.strokeStyle = `rgba(150, 104, 58, ${0.05 + rnd() * 0.12})`; x.lineWidth = 0.6 + rnd() * 1.8;
    x.beginPath(); let y = rnd() * 256; x.moveTo(0, y);
    for (let X = 0; X <= 256; X += 16) { y += (rnd() - 0.5) * 3; x.lineTo(X, y); }
    x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; return t;
})();
const WOOD = new THREE.MeshStandardMaterial({ color: C("#D9B98C"), map: woodTex, roughness: 0.6, envMapIntensity: 0.3 });
const CREAM = "#F2E9D8", INK = "#2A2724", MUSTARD = "#E0A526", TOMATO = "#D9533B";
const DARK = paint(INK, { roughness: 0.45, clearcoat: 0.3 });

function part(group, geo, material, pos = [0, 0, 0], rot = [0, 0, 0], scale) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos); m.rotation.set(...rot);
  if (scale) m.scale.set(...scale);
  m.castShadow = true; m.receiveShadow = true;
  group.add(m);
  return m;
}
// rounded box: every edge softened, like sanded wood
const rbox = (w, h, d, r = 0.04) => new THREE.RoundedBoxGeometry(w, h, d, 4, Math.min(r, Math.min(w, h, d) / 2 - 0.002));
// cylinder with rounded rims
function rcyl(r, h, b = 0.03, seg = 40) {
  b = Math.min(b, r * 0.9, (h / 2) * 0.95);
  const pts = [new THREE.Vector2(0, -h / 2)];
  for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, -h / 2 + b + Math.sin(a) * b)); }
  for (let i = 0; i <= 6; i++) { const a = (i / 6) * (Math.PI / 2); pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, h / 2 - b + Math.sin(a) * b)); }
  pts.push(new THREE.Vector2(0, h / 2));
  return new THREE.LatheGeometry(pts, seg);
}
const sph = (r, ws = 40, hs = 24) => new THREE.SphereGeometry(r, ws, hs);
const dowel = (r, h) => rcyl(r, h, r * 0.6, 20);

/* ---------- Shape helpers: profiles cut and sanded, like a wooden toy ---------- */
// extrude a 2D outline (in XY) to a given total depth along Z, with rounded edges, centered on Z
function extr(shape, depth, bevel = 0.035, segs = 5) {
  const core = Math.max(depth - 2 * bevel, 0.001);
  const g = new THREE.ExtrudeGeometry(shape, { depth: core, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: segs, curveSegments: 28 });
  g.translate(0, 0, -core / 2);
  return g;
}
function rrect(w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function rrectPath(w, h, r, cx = 0, cy = 0) { const p = new THREE.Path(); const sh = rrect(w, h, r, cx, cy); p.curves = sh.curves; p.currentPoint = sh.currentPoint; return p; }
function star(rOut, rIn, n = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? rIn : rOut, a = Math.PI / 2 + (i * Math.PI) / n; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  return s;
}
const lathe = (pts, seg = 48) => { const p = pts[0][1] > pts[pts.length - 1][1] ? [...pts].reverse() : pts; return new THREE.LatheGeometry(p.map(([r, y]) => new THREE.Vector2(r, y)), seg); };

/* ---------- The seven objects ---------- */
const BUILD = {
  // A wooden 4x4: one sculpted side profile with wheel arches, twin hood stripes, a bent beech roll bar, chunky tires
  OffroadToy(g, c) {
    const p = new THREE.Shape();
    p.moveTo(-0.9, 0.3); p.lineTo(-0.8, 0.27);
    p.absarc(-0.52, 0.27, 0.29, Math.PI, 0, true);
    p.lineTo(0.25, 0.27);
    p.absarc(0.54, 0.27, 0.29, Math.PI, 0, true);
    p.lineTo(0.92, 0.3); p.lineTo(0.94, 0.52);
    p.quadraticCurveTo(0.94, 0.63, 0.83, 0.63);
    p.lineTo(0.3, 0.65); p.quadraticCurveTo(0.22, 0.66, 0.17, 0.62);
    p.lineTo(-0.8, 0.62); p.quadraticCurveTo(-0.92, 0.62, -0.92, 0.5);
    p.lineTo(-0.9, 0.3);
    part(g, extr(p, 0.84, 0.06), paint(c));
    // windshield frame (a frame with an opening), tilted back
    const fr = rrect(0.8, 0.34, 0.06); fr.holes.push(rrectPath(0.66, 0.22, 0.04));
    const ws = new THREE.Group(); ws.position.set(0.24, 0.69, 0); ws.rotation.z = 0.28; // hinge at the cowl, leaning back
    part(ws, extr(fr, 0.05, 0.015), paint(CREAM), [0, 0.17, 0], [0, Math.PI / 2, 0]);
    part(ws, new THREE.PlaneGeometry(0.68, 0.24), mat("#BFD9E6", 0.1, 0, { transparent: true, opacity: 0.35, side: THREE.DoubleSide }), [0, 0.17, 0], [0, Math.PI / 2, 0]).userData.noOutline = true;
    g.add(ws);
    // black cabin floor
    part(g, rbox(1.02, 0.03, 0.74, 0.012), mat("#1E1C1A", 0.85, 0, { envMapIntensity: 0.15 }), [-0.35, 0.69, 0]);
    // bucket seats
    for (const z of [-0.2, 0.2]) {
      part(g, rbox(0.3, 0.08, 0.28, 0.035), paint(TOMATO), [-0.18, 0.74, z]);
      part(g, rbox(0.08, 0.3, 0.28, 0.035), paint(TOMATO), [-0.32, 0.88, z], [0, 0, 0.12]);
    }
    // bent roll bar
    const bar = new THREE.CatmullRomCurve3([[-0.56, 0.6, -0.36], [-0.56, 0.98, -0.32], [-0.56, 1.06, 0], [-0.56, 0.98, 0.32], [-0.56, 0.6, 0.36]].map(v => new THREE.Vector3(...v)));
    part(g, new THREE.TubeGeometry(bar, 48, 0.04, 14, false), WOOD);
    // wheels: thick tires with domed beech hubs
    const wheel = (x, y, z, rotY = 0) => {
      const w = new THREE.Group(); w.position.set(x, y, z); w.rotation.y = rotY;
      part(w, new THREE.TorusGeometry(0.19, 0.095, 22, 44), DARK);
      for (const sgn of [-1, 1]) part(w, lathe([[0, 0.07], [0.07, 0.065], [0.12, 0.045], [0.15, 0]], 36), WOOD, [0, 0, 0], [sgn * Math.PI / 2, 0, 0]);
      g.add(w);
    };
    for (const x of [-0.52, 0.54]) for (const z of [-0.44, 0.44]) wheel(x, 0.285, z);
    wheel(-1.0, 0.5, 0, Math.PI / 2);
    // round headlights and wooden bumpers
    for (const z of [-0.26, 0.26]) {
      part(g, lathe([[0, 0.05], [0.06, 0.045], [0.085, 0.02], [0.09, 0]], 28), paint(CREAM, { emissive: C("#FFE3A8"), emissiveIntensity: 0.3 }), [0.955, 0.5, z], [0, 0, -Math.PI / 2]);
    }
    for (const x of [-0.95, 0.97]) part(g, rbox(0.1, 0.13, 0.94, 0.05), WOOD, [x, 0.3, 0]);
  },

  // Atomic-age desk clock: a rounded trapezoid frame in sage around a maple face, bold numerals, paddle hands
  AlarmClock(g, c) {
    const SAGE = paint("#97301F", { roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.45 }); // mid-century red
    const roundPoly = (pts, r) => {
      const s2 = new THREE.Shape(), n = pts.length, V = p => new THREE.Vector2(p[0], p[1]);
      for (let i = 0; i < n; i++) {
        const p0 = V(pts[(i - 1 + n) % n]), p1 = V(pts[i]), p2 = V(pts[(i + 1) % n]);
        const a1 = p1.clone().add(p0.clone().sub(p1).normalize().multiplyScalar(r));
        const b1 = p1.clone().add(p2.clone().sub(p1).normalize().multiplyScalar(r));
        i ? s2.lineTo(a1.x, a1.y) : s2.moveTo(a1.x, a1.y);
        s2.quadraticCurveTo(p1.x, p1.y, b1.x, b1.y);
      }
      s2.closePath(); return s2;
    };
    const outer = [[-0.5, 0], [0.5, 0], [0.72, 1.0], [-0.72, 0.88]];
    const inner = [[-0.41, 0.09], [0.41, 0.09], [0.6, 0.91], [-0.6, 0.8]];
    const D = 0.34, frame = roundPoly(outer, 0.17);
    const hole = new THREE.Path(); hole.curves = roundPoly(inner, 0.11).curves; frame.holes.push(hole);
    part(g, extr(frame, D, 0.04), SAGE);
    part(g, extr(roundPoly(inner, 0.11), 0.03, 0.006, 2), SAGE, [0, 0, -D / 2 + 0.03]);      // back panel
    // maple face with numerals and dots drawn in
    const bx0 = -0.6, bx1 = 0.6, by0 = 0.09, by1 = 0.91, PX = 460;
    const cv = document.createElement("canvas"); cv.width = Math.round((bx1 - bx0) * PX); cv.height = Math.round((by1 - by0) * PX);
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
    tex.repeat.set(1 / (bx1 - bx0), 1 / (by1 - by0)); tex.offset.set(-bx0 / (bx1 - bx0), -by0 / (by1 - by0));
    const cxW = 0, cyW = 0.46, toPx = (x, y) => [(x - bx0) * PX, (by1 - y) * PX];
    const drawFace = () => {
      const x = cv.getContext("2d");
      x.fillStyle = "#F7F5F0"; x.fillRect(0, 0, cv.width, cv.height);
      x.fillStyle = "#1F1D1B"; x.textAlign = "center"; x.textBaseline = "middle";
      x.font = '800 58px Archivo, "Helvetica Neue", Arial, sans-serif';
      const R = 0.25;
      [["12", 0], ["3", 3], ["6", 6], ["9", 9]].forEach(([t, h]) => { const a = (h / 12) * Math.PI * 2, [px, py] = toPx(cxW + Math.sin(a) * R * 1.08, cyW + Math.cos(a) * R); x.fillText(t, px, py + 3); });
      for (let h = 0; h < 12; h++) { if (h % 3 === 0) continue; const a = (h / 12) * Math.PI * 2, [px, py] = toPx(cxW + Math.sin(a) * R * 1.12, cyW + Math.cos(a) * R * 1.02); x.beginPath(); x.arc(px, py, 7, 0, Math.PI * 2); x.fill(); }
      tex.needsUpdate = true;
    };
    drawFace();
    if (document.fonts) document.fonts.ready.then(drawFace);
    const faceZ = D / 2 - 0.07;
    const face = new THREE.Mesh(new THREE.ShapeGeometry(roundPoly(inner, 0.11), 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, envMapIntensity: 0.25 }));
    face.position.z = faceZ; face.receiveShadow = true; face.userData.noOutline = true; g.add(face);
    // paddle hands and a brushed steel cap
    const paddle = (len, w) => { const s2 = new THREE.Shape(); s2.moveTo(-w / 2, -0.035); s2.lineTo(w / 2, -0.035); s2.lineTo(w / 2, len - w / 2); s2.absarc(0, len - w / 2, w / 2, 0, Math.PI, false); s2.lineTo(-w / 2, -0.035); return extr(s2, 0.012, 0.004, 2); };
    const hand = (geo, z) => { const p = new THREE.Group(); p.position.set(cxW, cyW, z); part(p, geo, DARK).userData.noOutline = true; g.add(p); return p; };
    const hH = hand(paddle(0.17, 0.05), faceZ + 0.014), hM = hand(paddle(0.26, 0.042), faceZ + 0.03);
    part(g, rcyl(0.03, 0.03, 0.008, 24), mat("#BFC3C7", 0.3, 0.9), [cxW, cyW, faceZ + 0.045], [Math.PI / 2, 0, 0]).userData.noOutline = true;
    g.userData.updateTime = d => {
      const m = d.getMinutes() + d.getSeconds() / 60, h = (d.getHours() % 12) + m / 60;
      hM.rotation.z = -m / 60 * Math.PI * 2; hH.rotation.z = -h / 12 * Math.PI * 2;
    };
    g.userData.updateTime(new Date());
  },

  // A plump songbird with a two-tone body painted in one piece, leaf wings, on a turned pedestal
  Songbird(g, c) {
    part(g, lathe([[0, 0], [0.4, 0], [0.42, 0.02], [0.42, 0.06], [0.37, 0.09], [0.21, 0.1], [0.16, 0.14], [0, 0.14]], 56), WOOD);
    for (const z of [-0.07, 0.07]) part(g, dowel(0.016, 0.2), DARK, [0.02, 0.24, z]);
    const body = new THREE.SphereGeometry(0.36, 72, 48), pos = body.attributes.position, col = [];
    const top = C(c), belly = C(CREAM), tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i) * 1.25, y = pos.getY(i) * 0.95, z = pos.getZ(i) * 0.85;
      if (x < -0.18) { const t = Math.min((-x - 0.18) / 0.27, 1); y = y * (1 - 0.6 * t) + 0.2 * t; z *= 1 - 0.55 * t; x -= 0.28 * t; }
      pos.setXYZ(i, x, y, z);
      const k = THREE.MathUtils.smoothstep(-y, 0.0, 0.16) * THREE.MathUtils.smoothstep(x, -0.3, 0.0);
      tmp.copy(top).lerp(belly, k); col.push(tmp.r, tmp.g, tmp.b);
    }
    body.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    body.computeVertexNormals();
    part(g, body, paint("#FFFFFF", { vertexColors: true }), [0, 0.56, 0], [0, 0, 0.12]);
    part(g, sph(0.23, 48, 32), paint(c), [0.37, 0.86, 0]);
    part(g, new THREE.ConeGeometry(0.065, 0.17, 28), paint(MUSTARD), [0.65, 0.84, 0], [0, 0, -Math.PI / 2]);
    for (const z of [-0.155, 0.155]) {
      part(g, sph(0.034, 20, 14), DARK, [0.5, 0.92, z]);
      part(g, sph(0.009, 10, 8), paint(CREAM), [0.52, 0.935, z * 1.12]).userData.noOutline = true;
    }
    const leaf = new THREE.Shape(); leaf.moveTo(0.22, 0); leaf.quadraticCurveTo(0.05, 0.16, -0.24, 0.05); leaf.quadraticCurveTo(-0.3, 0.0, -0.24, -0.04); leaf.quadraticCurveTo(0.0, -0.1, 0.22, 0);
    for (const sg of [-1, 1]) part(g, extr(leaf, 0.04, 0.015, 3), paint("#3F6E8E"), [-0.04, 0.6, sg * 0.3], [sg * 0.25, sg * 0.15, -0.25]);
  },

  // Cream calculator with rounded keys
  Calculator(g, c) {
    part(g, rbox(0.94, 0.14, 1.52, 0.06), paint(CREAM), [0, 0.07, 0]);
    part(g, rbox(0.74, 0.03, 0.3, 0.012), DARK, [0, 0.14, -0.5]);
    part(g, rbox(0.62, 0.006, 0.17, 0.003), mat("#40513E", 0.4, 0, { emissive: C("#22301F"), emissiveIntensity: 0.6 }), [0, 0.157, -0.5]);
    for (let r = 0; r < 5; r++) for (let col = 0; col < 4; col++) {
      const m = col === 3 ? (r === 4 ? paint(MUSTARD) : paint(c)) : DARK;
      part(g, rcyl(0.078, 0.05, 0.02, 28), m, [-0.3 + col * 0.2, 0.155, -0.18 + r * 0.19]);
    }
  },
  // A rounded-corner notebook with a real elastic loop, a bookmark ribbon, and a two-tone pen
  Notebook(g, c) {
    const cover = extr(rrect(1.12, 1.52, 0.08), 0.045, 0.015, 3);
    part(g, cover, paint(c), [0, 0.023, 0], [-Math.PI / 2, 0, 0]);
    part(g, extr(rrect(1.06, 1.47, 0.06), 0.13, 0.012, 2), paint(CREAM, { roughness: 0.75, clearcoat: 0.05 }), [0.02, 0.11, 0], [-Math.PI / 2, 0, 0]);
    part(g, cover, paint(c), [0, 0.197, 0], [-Math.PI / 2, 0, 0]);
    part(g, new THREE.CylinderGeometry(0.11, 0.11, 1.5, 32, 1, false, Math.PI, Math.PI), paint(c), [-0.54, 0.11, 0], [Math.PI / 2, 0, 0]);
    const loop = rrect(1.6, 0.27, 0.05); loop.holes.push(rrectPath(1.54, 0.225, 0.03));
    part(g, extr(loop, 0.045, 0.008, 2), DARK, [0.42, 0.11, 0], [0, Math.PI / 2, 0]);
    const rib = new THREE.Shape(); rib.moveTo(-0.035, 0); rib.lineTo(0.035, 0); rib.lineTo(0.035, 0.4); rib.lineTo(0, 0.36); rib.lineTo(-0.035, 0.4); rib.lineTo(-0.035, 0);
    part(g, extr(rib, 0.008, 0.002, 1), paint(MUSTARD), [-0.25, 0.012, 0.74], [-Math.PI / 2, 0, 0]);
  },

  // A storybook lying on its back: rounded spine, cut-out crescent moon, stars and rolling hills on the cover
  Storybook(g, c) {
    c = "#5B3E8C"; // purple cover
    const top = 0.3;
    const cov = extr(rrect(1.14, 1.44, 0.05), 0.05, 0.015, 3);
    part(g, cov, paint(c), [0, 0.025, 0], [-Math.PI / 2, 0, 0]);
    part(g, extr(rrect(1.08, 1.38, 0.04), 0.22, 0.012, 2), paint(CREAM, { roughness: 0.75, clearcoat: 0.05 }), [0.025, 0.15, 0], [-Math.PI / 2, 0, 0]);
    part(g, cov, paint(c), [0, top - 0.025, 0], [-Math.PI / 2, 0, 0]);
    part(g, new THREE.CylinderGeometry(0.15, 0.15, 1.44, 36, 1, false, Math.PI, Math.PI), paint(c), [-0.56, 0.15, 0], [Math.PI / 2, 0, 0]);
    const on = (shape, m, x, z, lift = 0) => part(g, extr(shape, 0.008, 0.002, 1), m, [x, top + 0.004 + lift, z], [-Math.PI / 2, 0, 0]);
    const disc = r => { const d = new THREE.Shape(); d.absarc(0, 0, r, 0, Math.PI * 2, false); return d; };
    on(disc(0.17), paint(MUSTARD), 0.22, -0.38);
    on(disc(0.15), paint(c), 0.29, -0.43, 0.003);
    for (const [x, z, r] of [[-0.3, -0.46, 0.05], [-0.06, -0.24, 0.035], [-0.36, -0.12, 0.04], [0.05, -0.56, 0.03], [0.36, -0.02, 0.035]]) on(star(r, r * 0.45), paint(CREAM), x, z);
    const hill = (w, h, cx) => { const s = new THREE.Shape(); s.moveTo(cx - w / 2, 0); s.quadraticCurveTo(cx, h * 2, cx + w / 2, 0); s.lineTo(cx - w / 2, 0); return s; };
    { const s = hill(0.82, 0.28, 0.14); part(g, extr(s, 0.008, 0.002, 1), paint("#7FA86A"), [0, top + 0.004, 0.6], [-Math.PI / 2, 0, 0]); }
    { const s = hill(0.66, 0.2, -0.12); part(g, extr(s, 0.008, 0.002, 1), paint("#4E7D4A"), [0, top + 0.008, 0.6], [-Math.PI / 2, 0, 0]); }
    const rib = new THREE.Shape(); rib.moveTo(-0.03, 0); rib.lineTo(0.03, 0); rib.lineTo(0.03, 0.34); rib.lineTo(0, 0.3); rib.lineTo(-0.03, 0.34); rib.lineTo(-0.03, 0);
    part(g, extr(rib, 0.008, 0.002, 1), paint(TOMATO), [0.3, 0.012, 0.6], [-Math.PI / 2, 0, 0]);
  },

  // A pile of toy coins: raised rims, recessed faces, a star on each top coin, one rolling on its edge
  CoinPile(g, c) {
    const fin = { gold: paint(MUSTARD), silver: new THREE.MeshPhysicalMaterial({ color: C("#C9CDD2"), metalness: 0.85, roughness: 0.28, clearcoat: 0.4, clearcoatRoughness: 0.2 }), wood: WOOD };
    const coinGeo = r => lathe([[0, 0.044], [r - 0.035, 0.044], [r - 0.028, 0.052], [r - 0.012, 0.056], [r, 0.05], [r, 0.006], [r - 0.006, 0], [0, 0]], 44);
    let seed = 21; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const coin = (kind, r, x, y, z, rx = 0, rz = 0, emblem = false) => {
      const cg = new THREE.Group(); cg.position.set(x, y, z); cg.rotation.set(rx, rnd() * 6, rz);
      part(cg, coinGeo(r), fin[kind]);
      if (emblem) part(cg, extr(star(r * 0.42, r * 0.19), 0.012, 0.003, 1), fin[kind], [0, 0.05, 0], [-Math.PI / 2, 0, 0]).userData.noOutline = true;
      g.add(cg);
    };
    const stacks = [["gold", 0.2, 0, 0, 8], ["silver", 0.17, 0.4, -0.14, 5], ["wood", 0.19, 0.1, 0.38, 2]];
    for (const [k, r, x, z, n] of stacks) for (let i = 0; i < n; i++) coin(k, r, x + (rnd() - 0.5) * 0.035, i * 0.056, z + (rnd() - 0.5) * 0.035, 0, 0, i === n - 1);
    coin("silver", 0.17, -0.32, 0, 0.26, 0, 0, true);
    coin("gold", 0.2, 0.42, 0.0, 0.24, 0, 0, true);
    coin("gold", 0.2, -0.16, 0, -0.52, 0, 0, true);
  }
};

/* Low-poly treasure chest: a hollow box with real walls, a curved lid shell, a mound of gold with coins that don't overlap */
function TreasureChest(g) {
  const woodM = new THREE.MeshStandardMaterial({ color: C("#7B4A2A"), flatShading: true, roughness: 0.8 });
  const woodIn = new THREE.MeshStandardMaterial({ color: C("#4E2B17"), flatShading: true, roughness: 0.9, side: THREE.DoubleSide });
  const band = new THREE.MeshStandardMaterial({ color: C("#5B5F66"), flatShading: true, roughness: 0.5, metalness: 0.6 });
  const gold = new THREE.MeshStandardMaterial({ color: C("#F2C33A"), flatShading: true, roughness: 0.35, metalness: 0.55, emissive: C("#5A3F00"), emissiveIntensity: 0.25 });
  const W = 1.2, H = 0.62, D = 0.78, T = 0.06;
  // box: floor and four walls
  part(g, rbox(W, T, D, 0.015), woodM, [0, T / 2, 0]);
  part(g, rbox(W, H, T, 0.015), woodM, [0, H / 2, D / 2 - T / 2]);
  part(g, rbox(W, H, T, 0.015), woodM, [0, H / 2, -D / 2 + T / 2]);
  part(g, rbox(T, H, D - 2 * T, 0.015), woodM, [W / 2 - T / 2, H / 2, 0]);
  part(g, rbox(T, H, D - 2 * T, 0.015), woodM, [-W / 2 + T / 2, H / 2, 0]);
  // iron bands wrap the outside of the box
  for (const x of [-0.4, 0.4]) {
    part(g, rbox(0.1, H + 0.01, 0.025, 0.008), band, [x, H / 2, D / 2 + 0.012]);
    part(g, rbox(0.1, H + 0.01, 0.025, 0.008), band, [x, H / 2, -D / 2 - 0.012]);
  }
  part(g, rbox(0.15, 0.18, 0.035, 0.015), gold, [0, H - 0.11, D / 2 + 0.03]);
  // the chest is heaped with loose coins: a dark-gold bed deep down, and several layers of overlapping coins on top
  const iw = W - 2 * T - 0.01, id = D - 2 * T - 0.01, top = H - 0.02;
  const moundH = (x, z) => { const u = x / (iw / 2), v = z / (id / 2); return top + 0.13 * Math.max(0, 1 - (u * u * 0.7 + v * v)); };
  const deep = new THREE.MeshStandardMaterial({ color: C("#8A5C0E"), flatShading: true, roughness: 0.7, metalness: 0.2 });
  const mg = new THREE.PlaneGeometry(iw, id, 10, 7); mg.rotateX(-Math.PI / 2);
  const mp = mg.attributes.position; for (let i = 0; i < mp.count; i++) mp.setY(i, moundH(mp.getX(i), mp.getZ(i)) - 0.07);
  mg.computeVertexNormals();
  part(g, mg, deep);
  part(g, rbox(iw, top - T - 0.07, id, 0.01), deep, [0, T + (top - T - 0.07) / 2, 0]);
  {
    const r = 0.062, th = 0.016, base = new THREE.CylinderGeometry(r, r, th, 12).toNonIndexed();
    const sideN = base.groups[0].count;
    const faces = [new THREE.Color("#F6CB45"), new THREE.Color("#EDBB2E"), new THREE.Color("#F9D65F"), new THREE.Color("#E3AE24")];
    const rim = new THREE.Color("#B8860F");
    let sd = 19; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const pos = [], nor = [], col = [];
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), P = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), n = new THREE.Vector3(), tilt = new THREE.Quaternion(), yaw = new THREE.Quaternion();
    const NM = new THREE.Matrix3(), bp = base.attributes.position, bn = base.attributes.normal, v = new THREE.Vector3();
    const LAYERS = 4, step = 2 * r + 0.004;
    for (let L = 0; L < LAYERS; L++) {
      const ox = rnd() * step, oz = rnd() * step;
      for (let row = 0, z = -id / 2 + r * 0.6 + oz * 0.5; z <= id / 2 - r * 0.6; z += step * 0.87, row++) {
        for (let x = -iw / 2 + r * 0.6 + ox * 0.5 + (row % 2 ? step / 2 : 0); x <= iw / 2 - r * 0.6; x += step) {
          if (L === LAYERS - 1 && rnd() < 0.18) continue; // gaps in the top layer let the coins below show through
          const e = 0.01, hx = moundH(x + e, z) - moundH(x - e, z), hz = moundH(x, z + e) - moundH(x, z - e);
          n.set(-hx / (2 * e), 1, -hz / (2 * e)).normalize();
          Q.setFromUnitVectors(up, n);
          const a = rnd() * Math.PI * 2, t = 0.06 + rnd() * 0.22;
          tilt.setFromAxisAngle(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), t); yaw.setFromAxisAngle(up, rnd() * Math.PI);
          Q.multiply(tilt).multiply(yaw);
          const reach = r * Math.cos(t) + 0.004, cx = Math.max(-iw / 2 + reach, Math.min(iw / 2 - reach, x + (rnd() - 0.5) * 0.03)), cz = Math.max(-id / 2 + reach, Math.min(id / 2 - reach, z + (rnd() - 0.5) * 0.03));
          P.set(cx, moundH(cx, cz) - (LAYERS - 1 - L) * 0.024 + th / 2 + Math.sin(t) * r * 0.5, cz);
          M.compose(P, Q, S); NM.getNormalMatrix(M);
          const face = faces[Math.floor(rnd() * faces.length)];
          for (let k = 0; k < bp.count; k++) {
            v.fromBufferAttribute(bp, k).applyMatrix4(M); pos.push(v.x, v.y, v.z);
            v.fromBufferAttribute(bn, k).applyMatrix3(NM).normalize(); nor.push(v.x, v.y, v.z);
            const c2 = k < sideN ? rim : face; col.push(c2.r, c2.g, c2.b);
          }
        }
      }
    }
    const heap = new THREE.BufferGeometry();
    heap.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    heap.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    heap.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    part(g, heap, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.35, metalness: 0.55, emissive: C("#5A3F00"), emissiveIntensity: 0.2 }));
  }
  // lid: a hollow half-barrel shell with two end caps, hinged at the back and propped open
  const R = D / 2, ring = new THREE.Shape();
  ring.absarc(0, 0, R, 0, Math.PI, false); ring.lineTo(-(R - T), 0); ring.absarc(0, 0, R - T, Math.PI, 0, true); ring.lineTo(R, 0);
  const shell = new THREE.ExtrudeGeometry(ring, { depth: W - 2 * T, bevelEnabled: false, curveSegments: 8 });
  shell.translate(0, 0, -(W - 2 * T) / 2); shell.rotateY(Math.PI / 2);
  const cap = new THREE.Shape(); cap.absarc(0, 0, R, 0, Math.PI, false); cap.lineTo(R, 0);
  const capG = new THREE.ExtrudeGeometry(cap, { depth: T, bevelEnabled: false, curveSegments: 8 }); capG.translate(0, 0, -T / 2); capG.rotateY(Math.PI / 2);
  const lid = new THREE.Group(); lid.position.set(0, H, -D / 2); lid.rotation.x = -1.9;
  const inner = new THREE.Group(); inner.position.set(0, 0, R); lid.add(inner);
  part(inner, shell, woodM);
  part(inner, capG, woodM, [W / 2 - T / 2, 0, 0]);
  part(inner, capG, woodM, [-W / 2 + T / 2, 0, 0]);
  const bandG = new THREE.ExtrudeGeometry((() => { const b2 = new THREE.Shape(); b2.absarc(0, 0, R + 0.015, 0, Math.PI, false); b2.lineTo(-R, 0); b2.absarc(0, 0, R, Math.PI, 0, true); b2.lineTo(R + 0.015, 0); return b2; })(), { depth: 0.1, bevelEnabled: false, curveSegments: 8 });
  bandG.translate(0, 0, -0.05); bandG.rotateY(Math.PI / 2);
  for (const x of [-0.4, 0.4]) part(inner, bandG, band, [x, 0, 0]);
  g.add(lid);
}

// A sleepy crescent moon tucked into puffy clouds, lying on the Nella cover (shape y = toward the top of the book)
function SleepyMoon(g) {
  const M = (c, r = 0.55) => new THREE.MeshStandardMaterial({ color: C(c).convertSRGBToLinear(), roughness: r, metalness: 0 });
  const add = (geo, m, pos, rot = [-Math.PI / 2, 0, 0], sc) => { const o = new THREE.Mesh(geo, m); o.position.set(...pos); o.rotation.set(...rot); if (sc) o.scale.set(...sc); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
  const R = 0.42, a = (2 * Math.PI) / 3;
  const moon = new THREE.Shape();
  moon.moveTo(Math.cos(a) * R, Math.sin(a) * R);
  moon.absarc(0, 0, R, a, -a, true);
  // the inner edge is a face in profile, looking left: chin, lips, nose, brow
  moon.splineThru([[-0.1, -0.25], [-0.085, -0.175], [-0.058, -0.15], [-0.072, -0.115], [-0.05, -0.085], [-0.105, -0.035], [-0.04, 0.02], [-0.025, 0.1], [-0.07, 0.23], [Math.cos(a) * R, Math.sin(a) * R]].map(([x, y]) => new THREE.Vector2(x, y)));
  const H = 0.07;
  add(extr(moon, H, 0.02, 3), M("#F6C945", 0.45), [0, H / 2, 0]);
  const top = H + 0.002;
  const disc = r => { const d = new THREE.Shape(); d.absarc(0, 0, r, 0, Math.PI * 2, false); return d; };
  // craters and a rosy cheek
  for (const [x, y, r] of [[0.27, 0.16, 0.04], [0.31, -0.04, 0.028], [0.17, 0.3, 0.025], [0.25, -0.2, 0.034], [0.34, 0.08, 0.018]]) add(extr(disc(r), 0.01, 0.003, 1), M("#E8A93A"), [x, top, -y]);
  add(extr(disc(0.052), 0.01, 0.004, 1), M("#F4A03E"), [0.085, top + 0.001, 0.085]);
  // closed eye and lashes, drawn as thin tubes
  const ink = M("#2A2850", 0.6), tube = (pts, r = 0.011) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, top + 0.004, -y))), 24, r, 6, false);
  const eye = []; for (let i = 0; i <= 8; i++) { const t = Math.PI * (0.05 + 0.9 * i / 8); eye.push([0.065 + Math.cos(t) * 0.06, 0.04 - Math.sin(t) * 0.032]); }
  add(tube(eye), ink, [0, 0, 0], [0, 0, 0]);
  for (const t of [0.3, 0.5, 0.7]) { const th = Math.PI * t, x = 0.065 + Math.cos(th) * 0.06, y = 0.04 - Math.sin(th) * 0.032; add(tube([[x, y], [x + Math.cos(th) * 0.014, y - 0.032]], 0.007), ink, [0, 0, 0], [0, 0, 0]); }
  // clouds: soft squashed puffs, a low bank behind the moon on the right and a taller one wrapped over its lower tip
  const cloud = M("#CFDDF0", 0.75), cloudHi = M("#E8F0FA", 0.75);
  const puff = (x, y, r, m, lift) => add(new THREE.SphereGeometry(r, 28, 16), m, [x, lift, -y], [0, 0, 0], [1, 0.55, 1]);
  for (const [x, y, r] of [[0.3, -0.37, 0.075], [0.41, -0.32, 0.09], [0.52, -0.37, 0.07]]) puff(x, y, r, cloud, 0);
  for (const [x, y, r, hi] of [[-0.34, -0.38, 0.075], [-0.21, -0.32, 0.1, 1], [-0.05, -0.33, 0.115, 1], [0.1, -0.38, 0.09], [-0.27, -0.45, 0.07], [-0.12, -0.44, 0.08], [0.03, -0.45, 0.075]]) puff(x, y, r, hi ? cloudHi : cloud, H * 0.6);
}

// A toy-style wooden duck decoy in the diorama's own look: matte solid colours and soft facets.
// A teardrop body with a raised pointed tail, and one continuous piece for the neck, head and bill. Sits on y = 0, breast toward +x.
function WoodenDecoy(g) {
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const key = (rows, t) => { for (let i = 1; i < rows.length; i++) if (t <= rows[i][0]) { const [t0, ...a] = rows[i - 1], [t1, ...b] = rows[i], k = (t - t0) / (t1 - t0), s = k * k * (3 - 2 * k); return a.map((v, j) => v + (b[j] - v) * s); } return rows[rows.length - 1].slice(1); };
  const lin = c => C(c).convertSRGBToLinear();
  const WOOD = lin("#7D5636"), WOOD_DK = lin("#5E3D24"), BILL = lin("#43291A");
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.78, metalness: 0 });
  const mesh = (pos, col, idx) => { const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals(); const o = new THREE.Mesh(geo, mat); o.castShadow = o.receiveShadow = true; return o; };
  const tmp = new THREE.Color();
  // body: lofted from the tail tip (u = 0) to the breast (u = 1); rows are [u, half-width, top, bottom]
  const P = [[0, 0.015, 0.305, 0.275], [0.12, 0.085, 0.3, 0.17], [0.3, 0.155, 0.32, 0.07], [0.5, 0.195, 0.34, 0.01], [0.7, 0.205, 0.34, 0.0],
             [0.85, 0.19, 0.315, 0.008], [0.95, 0.135, 0.255, 0.05], [1, 0.01, 0.175, 0.13]];
  const L = 1.0, NU = 16, NV = 18, pos = [], col = [], idx = [];
  for (let j = 0; j <= NV; j++) {
    const u = j / NV, [w, top, bot] = key(P, u), yc = (top + bot) / 2, hh = (top - bot) / 2;
    for (let i = 0; i < NU; i++) {
      const th = (i / NU) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th), n = s >= 0 ? 2.1 : 3.4;
      pos.push(-L / 2 + u * L, yc + hh * Math.sign(s) * Math.pow(Math.abs(s), 2 / n), w * Math.sign(c) * Math.pow(Math.abs(c), 2 / n));
      tmp.copy(WOOD).lerp(WOOD_DK, 0.55 * (1 - ss(0.05, 0.3, u)) + 0.25 * (s < -0.3 ? 1 : 0)); col.push(tmp.r, tmp.g, tmp.b);
    }
  }
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * NU + i, b = j * NU + (i + 1) % NU, c2 = a + NU, d2 = b + NU; idx.push(a, c2, b, b, c2, d2); }
  for (const [u, first] of [[0, 0], [1, NV * NU]]) {
    const [, top, bot] = key(P, u), ctr = pos.length / 3; pos.push(-L / 2 + u * L, (top + bot) / 2, 0); tmp.copy(u ? WOOD : WOOD_DK); col.push(tmp.r, tmp.g, tmp.b);
    for (let i = 0; i < NU; i++) u ? idx.push(ctr, first + (i + 1) % NU, first + i) : idx.push(ctr, i, (i + 1) % NU);
  }
  g.add(mesh(pos, col, idx));
  // neck, head and bill: one piece swept along the underside line (front of the neck, under the chin, under the bill)
  const hg = new THREE.Group(); hg.rotation.y = 0.18; g.add(hg);
  const spine = new THREE.CatmullRomCurve3([[0.26, 0.2], [0.305, 0.34], [0.32, 0.41], [0.36, 0.452], [0.445, 0.445], [0.54, 0.425], [0.64, 0.408]].map(([x, y]) => new THREE.Vector3(x, y, 0)), false, "centripetal");
  // [arc position, depth from the underside toward the back of the neck / crown, half-width]
  const R = [[0, 0.24, 0.13], [0.2, 0.15, 0.085], [0.38, 0.17, 0.09], [0.5, 0.215, 0.108], [0.59, 0.2, 0.108], [0.67, 0.12, 0.085], [0.73, 0.07, 0.068], [0.86, 0.05, 0.06], [0.97, 0.035, 0.045], [1, 0.006, 0.012]];
  const HU = 14, HV = 22, hp = [], hc = [], hi = [], Z = new THREE.Vector3(0, 0, 1);
  const frame = t => { const c = spine.getPointAt(t), T = spine.getTangentAt(t); return [c, new THREE.Vector3().crossVectors(Z, T).normalize()]; };
  for (let j = 0; j <= HV; j++) {
    const t = j / HV, [a, b] = key(R, t), [c, N] = frame(t), lip = 0.012, mid = (a - lip) / 2, half = (a + lip) / 2;
    tmp.copy(WOOD).lerp(BILL, ss(0.66, 0.72, t));
    for (let i = 0; i < HU; i++) { const th = (i / HU) * Math.PI * 2, off = mid + half * Math.sin(th); hp.push(c.x + N.x * off, c.y + N.y * off, b * Math.cos(th)); hc.push(tmp.r, tmp.g, tmp.b); }
  }
  for (let j = 0; j < HV; j++) for (let i = 0; i < HU; i++) { const a = j * HU + i, b = j * HU + (i + 1) % HU, c2 = a + HU, d2 = b + HU; hi.push(a, b, c2, b, d2, c2); }
  { const [c] = frame(1), ctr = hp.length / 3, first = HV * HU; hp.push(c.x + 0.004, c.y, 0); hc.push(BILL.r, BILL.g, BILL.b); for (let i = 0; i < HU; i++) hi.push(ctr, first + i, first + (i + 1) % HU); }
  hg.add(mesh(hp, hc, hi));
  // matte black eyes set into the sides of the head
  const eyeM = new THREE.MeshStandardMaterial({ color: lin("#1B1410"), roughness: 0.6, flatShading: true });
  const te = 0.55, [a, b] = key(R, te), [c, N] = frame(te);
  for (const sd of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), eyeM); o.position.set(c.x + N.x * a * 0.6, c.y + N.y * a * 0.6, sd * b * 0.88); hg.add(o); }
}

// A chunky toy canary in the same language as its neighbours (the desk clock, the moon book, the chest):
// simple rounded solids in flat matte colour, soft bevelled cut-outs for wings and tail, a big round head,
// dark bead eyes with a glint, and short orange legs. Stands on y = 0, facing +x.
function Canary(g) {
  const M = (c, r = 0.6) => new THREE.MeshStandardMaterial({ color: C(c), roughness: r, metalness: 0, envMapIntensity: 0.35 });
  const YELLOW = M("#FFD43E", 0.5), WING = M("#FBB52C", 0.55), ORANGE = M("#F7913F", 0.55), EYE = M("#24201C", 0.35), GLINT = M("#FFF6E4", 0.5);
  // rounded body and head
  part(g, sph(0.4, 48, 32), YELLOW, [-0.04, 0.56, 0], [0, 0, 0.42], [1.28, 0.9, 0.86]);
  const H = new THREE.Vector3(0.24, 0.97, 0), HR = 0.265;
  part(g, sph(HR, 48, 32), YELLOW, H.toArray());
  // beak: a short rounded cone
  part(g, new THREE.ConeGeometry(0.08, 0.18, 32), ORANGE, [0.55, 0.94, 0], [0, 0, -Math.PI / 2 - 0.1]);
  part(g, sph(0.08, 24, 16), ORANGE, [0.47, 0.945, 0], [0, 0, 0], [0.6, 1, 1]);
  // decals on the head: eyes with a glint, each flattened against the surface
  const onHead = (dir, r, m, flat, sc = [1, 1]) => { const n = new THREE.Vector3(...dir).normalize(), o = part(g, sph(r, 24, 16), m, H.clone().addScaledVector(n, HR - r * flat * 0.4).toArray(), [0, 0, 0], [sc[0], sc[1], flat]); o.lookAt(H.clone().addScaledVector(n, 5)); return o; };
  for (const s of [-1, 1]) {
    onHead([0.5, 0.28, s * 0.82], 0.048, EYE, 0.55, [0.9, 1.15]);
    onHead([0.52, 0.36, s * 0.78], 0.014, GLINT, 0.6).userData.noOutline = true;
  }
  // wings: thick teardrop cut-outs hugging the sides, tips sweeping back
  const wing = new THREE.Shape(); wing.moveTo(0.2, 0.06); wing.bezierCurveTo(0.2, 0.2, -0.05, 0.2, -0.36, 0.02); wing.bezierCurveTo(-0.2, -0.1, 0.2, -0.12, 0.2, 0.06);
  for (const s of [-1, 1]) part(g, extr(wing, 0.08, 0.035, 4), WING, [-0.1, 0.55, s * 0.31], [0, s * -0.14, 0.38]);
  // tail: a thick rounded fan reaching back and down
  const tail = new THREE.Shape(); tail.moveTo(0.08, 0.09); tail.lineTo(-0.42, 0.14); tail.quadraticCurveTo(-0.54, 0, -0.42, -0.14); tail.lineTo(0.08, -0.09); tail.quadraticCurveTo(0.12, 0, 0.08, 0.09);
  const tg = new THREE.Group(); tg.position.set(-0.4, 0.42, 0); tg.rotation.z = 0.42; g.add(tg);
  part(tg, extr(tail, 0.08, 0.035, 4), WING, [0, 0, 0], [Math.PI / 2, 0, 0]);
  // short orange legs and three rounded toes on each foot
  for (const z of [-0.1, 0.1]) {
    part(g, dowel(0.04, 0.24), ORANGE, [0.03, 0.12, z]);
    for (const yaw of [-0.5, 0, 0.5]) {
      const t = new THREE.Group(); t.position.set(0.03, 0.032, z); t.rotation.y = yaw; g.add(t);
      part(t, dowel(0.032, 0.14), ORANGE, [0.065, 0, 0], [0, 0, Math.PI / 2]);
    }
  }
}

/* ---------- Place objects ---------- */
const LAYOUT = {
  outlandish: [-5.7, -2.0, 0.12], allora: [-1.9, -2.3, -0.05], starling: [1.9, -2.3, 0.08], estimator: [5.7, -2.0, -0.1],
  stash: [-3.8, 1.9, 0.1], nella: [0, 2.1, -0.06], annie: [3.8, 1.9, 0.05]
};
// Phones and narrow screens: the same order, zigzagged front to back down a two-wide column so it fills a portrait view
if (MOBILE) ["outlandish", "allora", "starling", "estimator", "stash", "nella", "annie"].forEach((id, i) => {
  LAYOUT[id] = [i % 2 ? 1.9 : -1.9, -4.4 + i * 2.0, LAYOUT[id][2]];
});
const FOOTPRINT = 3.1;
function diorama(p) {
  const holder = new THREE.Group(), src = window.GLB && GLB[p.id];
  if (!src) { BUILD[{ outlandish: "OffroadToy", allora: "AlarmClock", starling: "Songbird", estimator: "Calculator", stash: "Notebook", nella: "Storybook", annie: "CoinPile" }[p.id]](holder, p.color); return holder; }
  const model = src;
  model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const pre = new THREE.Box3().setFromObject(model), preSz = pre.getSize(new THREE.Vector3()), preC = pre.getCenter(new THREE.Vector3());
  let meshColFn = null;
  // drop the decorative trees (tall, narrow meshes outside the hero object); keep rocks and grass
  {
    const hero = []; model.traverse(o => { if (o !== model && o.name && /_1$/.test(o.name)) hero.push(o); });
    const inHero = o => { for (let q = o; q; q = q.parent) if (hero.includes(q)) return true; return false; };
    const all = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()), span0 = Math.max(all.x, all.z), trees = [];
    const greens = [];
    const meshCol = meshColFn = o => {
      const ca = o.geometry && o.geometry.attributes.color;
      const base = o.material.color ? o.material.color.clone() : new THREE.Color(1, 1, 1);
      if (ca) { let r = 0, g2 = 0, b = 0; const n = Math.min(ca.count, 400); for (let i = 0; i < n; i++) { r += ca.getX(i); g2 += ca.getY(i); b += ca.getZ(i); } base.multiply(new THREE.Color(r / n, g2 / n, b / n)); }
      const map = o.material.map, uv = o.geometry && o.geometry.attributes.uv;
      if (map && map.image && uv) {
        const img = map.image; let cv = img.__cv;
        if (!cv) { cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; cv.getContext("2d").drawImage(img, 0, 0); img.__cv = cv; }
        const ctx = cv.getContext("2d"); let r = 0, g2 = 0, b = 0, n = 0;
        for (let i = 0; i < uv.count; i += Math.max(1, Math.floor(uv.count / 60))) {
          let u = uv.getX(i), v = uv.getY(i); if (!map.flipY) v = v; else v = 1 - v;
          const px = ctx.getImageData(Math.min(cv.width - 1, Math.max(0, Math.floor(u * cv.width))), Math.min(cv.height - 1, Math.max(0, Math.floor(v * cv.height))), 1, 1).data;
          r += px[0]; g2 += px[1]; b += px[2]; n++;
        }
        if (n) base.setRGB(r / n / 255, g2 / n / 255, b / n / 255);
      }
      return base;
    };
    model.traverse(o => {
      if (!o.isMesh || inHero(o) || !o.material) return;
      const c0 = meshCol(o), b0 = new THREE.Box3().setFromObject(o), sz0 = b0.getSize(new THREE.Vector3());
      if (c0.g > c0.r * 1.15 && c0.g > c0.b * 1.3 && Math.max(sz0.x, sz0.z) > span0 * 0.035) { trees.push(o); greens.push(b0); }
    });
    // trunks: small brown meshes sitting under a removed crown
    model.traverse(o => {
      if (!o.isMesh || inHero(o) || !o.material) return;
      const c0 = meshCol(o), cc = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
      if (c0.r > c0.b * 1.4 && c0.r > c0.g * 1.1 && greens.some(gb => cc.x > gb.min.x && cc.x < gb.max.x && cc.z > gb.min.z && cc.z < gb.max.z)) trees.push(o);
    });
    trees.forEach(o => o.parent && o.parent.remove(o));
  }
  // swap a named node for a code-built object, standing where it was
  const swap = (rx, build, frac) => {
    let node = null, best = Infinity;
    model.traverse(o => { if (o !== model && rx.test(o.name)) { const v = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()); const vol = v.x * v.z; if (vol < best) { best = vol; node = o; } } });
    if (!node) return null;
    const wb = new THREE.Box3().setFromObject(node), wc = wb.getCenter(new THREE.Vector3());
    const isz = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    node.parent.remove(node);
    const zone = wb.clone().expandByScalar(0.05), strays = [];
    model.traverse(o => { if (o.isMesh && o.parent && /auxscene/i.test(o.parent.name) && new THREE.Box3().setFromObject(o).intersectsBox(zone)) strays.push(o); });
    strays.forEach(o => o.parent && o.parent.remove(o));
    const grp = new THREE.Group(); build(grp);
    const gb = new THREE.Box3().setFromObject(grp).getSize(new THREE.Vector3());
    grp.scale.setScalar((Math.max(isz.x, isz.z) * frac) / Math.max(gb.x, gb.z)); grp.position.set(wc.x, wb.min.y, wc.z);
    model.add(grp); return grp;
  };
  const swapped = [];
  if (p.id === "annie") { const ch = swap(/^Coins$/, TreasureChest, 0.52); if (ch) swapped.push(ch); }
  if (p.id === "starling") {
    // replace the balancing eagle (with its stick and rock) by a toy canary standing on the grass where it stood
    const eagle = model.getObjectByName("Balancing_Eagle_1");
    if (eagle) {
      const eb = new THREE.Box3().setFromObject(eagle), ec = eb.getCenter(new THREE.Vector3()), es = eb.getSize(new THREE.Vector3());
      eagle.parent.remove(eagle);
      const duck = new THREE.Group(); Canary(duck);
      const ds = new THREE.Box3().setFromObject(duck).getSize(new THREE.Vector3());
      duck.scale.setScalar((Math.max(es.x, es.z) * 1.0) / Math.max(ds.x, ds.z)); duck.position.set(ec.x, eb.min.y, ec.z); duck.rotation.y = -0.45;
      model.add(duck); swapped.push(duck);
    }
  }
  if (p.id === "allora") {
    // swap the wristwatch for the desk clock, standing where the watch lay
    // the file nests the whole diorama under a "Watch" node too; pick the smallest match, which is the watch itself
    let watch = null, best = Infinity;
    model.traverse(o => { if (o !== model && /watch/i.test(o.name)) { const v = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()); const vol = v.x * v.z; if (vol < best) { best = vol; watch = o; } } });
    if (watch) {
      const wb = new THREE.Box3().setFromObject(watch), wc = wb.getCenter(new THREE.Vector3());
      const ib = new THREE.Box3().setFromObject(model), isz = ib.getSize(new THREE.Vector3());
      watch.parent.remove(watch);
      // clear leftover small watch parts that lived outside the "Watch" node (strap holes, markers)
      const zone = wb.clone().expandByScalar(0.05), strays = [];
      model.traverse(o => { if (o.isMesh) { const ob = new THREE.Box3().setFromObject(o), os = ob.getSize(new THREE.Vector3()); if (Math.max(os.x, os.z) < Math.max(isz.x, isz.z) * 0.2 && zone.containsPoint(ob.getCenter(new THREE.Vector3())) && ob.min.y >= wb.min.y - 0.02) strays.push(o); } });
      model.traverse(o => { if (o.isMesh && o.parent && /auxscene/i.test(o.parent.name)) { const ob = new THREE.Box3().setFromObject(o); if (ob.intersectsBox(zone)) strays.push(o); } });
      strays.forEach(o => o.parent && o.parent.remove(o));
      const clockG = new THREE.Group(); BUILD.AlarmClock(clockG, p.color);
      const s = (Math.max(isz.x, isz.z) * 0.46) / 1.44;
      clockG.scale.setScalar(s); clockG.position.set(wc.x, wb.min.y, wc.z);
      model.add(clockG); swapped.push(clockG); holder.userData.updateTime = clockG.userData.updateTime;
    }
  }
  const b = new THREE.Box3().setFromObject(model), sz = preSz, c = preC;
  const k = FOOTPRINT / Math.max(sz.x, sz.z);
  // drop the island: wide, thin slabs that span most of the footprint
  const span = Math.max(sz.x, sz.z), slabs = [];
  model.traverse(o => { if (o.isMesh) { const ob = new THREE.Box3().setFromObject(o), os = ob.getSize(new THREE.Vector3()); if (Math.max(os.x, os.z) > span * 0.7 && os.y < span * 0.12) slabs.push(o); } });
  // the island's top surface becomes ground level; rocks and grass that were sunk into it sink into the meadow instead
  let groundY = -Infinity;
  slabs.forEach(o => { groundY = Math.max(groundY, new THREE.Box3().setFromObject(o).max.y); });
  slabs.forEach(o => o.parent && o.parent.remove(o));
  if (!isFinite(groundY)) groundY = new THREE.Box3().setFromObject(model).min.y;
  model.position.set(-c.x * k, -groundY * k, -c.z * k); model.scale.multiplyScalar(k);
  holder.add(model);
  holder.userData.glb = true;
  // the parts that lift on hover: everything except the loose rocks and grass around the object
  const hero = []; model.traverse(o => { if (o !== model && o.name && /_1$/.test(o.name)) hero.push(o); });
  const under = (o, list) => { for (let q = o; q; q = q.parent) if (list.includes(q)) return true; return false; };
  const scenery = o => {
    if (!meshColFn) return false;
    const c0 = meshColFn(o), hsl = {}; c0.getHSL(hsl);
    const grass = c0.g > c0.r * 1.1 && c0.g > c0.b * 1.2;
    const rock = hsl.s < 0.25 && hsl.l > 0.55;
    return grass || rock;
  };
  const lift = [...swapped];
  model.traverse(o => { if (o.isMesh && !under(o, swapped) && (under(o, hero) || !scenery(o))) lift.push(o); });
  if (p.id === "nella") {
    // deep Nella purple; a plain cover and spine (no gold bands, frame, panel, moon, stars or title bars), then a sleepy moon in the clouds
    const purple = new THREE.MeshStandardMaterial({ color: C("#2B1356"), flatShading: true, roughness: 0.7 });
    const purpleDeep = new THREE.MeshStandardMaterial({ color: C("#1E0B3F"), flatShading: true, roughness: 0.75 });
    const gone = []; let cover = null;
    model.traverse(o => {
      if (!o.isMesh) return;
      if (/^mesh_1_instance_[01]$/.test(o.name)) { o.material = purple; if (!cover || o.position.y > cover.position.y) cover = o; }
      else if (o.name === "mesh_3") o.material = purpleDeep;
      else if (/^mesh_(4|5_instance_\d|6|7|8|9|10|11|12|13|14|15)$/.test(o.name)) gone.push(o); // 15 = bookmark ribbon
    });
    gone.forEach(o => { o.parent && o.parent.remove(o); const i = lift.indexOf(o); if (i >= 0) lift.splice(i, 1); });
    if (cover) {
      cover.geometry.computeBoundingBox();
      const art = new THREE.Group(); SleepyMoon(art);
      art.position.set(-0.04, cover.position.y + cover.geometry.boundingBox.max.y * cover.scale.y, -0.06);
      cover.parent.add(art); lift.push(art);
    }
  }
  if (p.id === "stash") {
    // black cover and spine
    const black = new THREE.MeshStandardMaterial({ color: C("#1F1E1C"), flatShading: true, roughness: 0.75 });
    model.traverse(o => { if (o.isMesh && /^mesh_(1_instance_0|1_instance_1|3)$/.test(o.name)) o.material = black; });
    // drop the slip of paper poking out of the top of the notebook
    const slip = []; model.traverse(o => { if (o.isMesh && /^mesh_(7|8|9|10)$/.test(o.name)) slip.push(o); });
    slip.forEach(o => { o.parent && o.parent.remove(o); const i = lift.indexOf(o); if (i >= 0) lift.splice(i, 1); });
  }
  // lift along the holder's up axis, converted into each part's own parent space (some parts, like the pencil, sit in rotated groups)
  holder.updateMatrixWorld(true);
  const toHolder = new THREE.Matrix4().copy(holder.matrixWorld).invert();
  holder.userData.liftParts = lift.map(o => {
    const rel = new THREE.Matrix4().multiplyMatrices(toHolder, o.parent.matrixWorld);
    const d = new THREE.Vector3(0, 1, 0).applyMatrix3(new THREE.Matrix3().setFromMatrix4(rel).invert());
    return { o, p0: o.position.clone(), d };
  });
  return holder;
}
const objects = [];
const outlineSel = new THREE.MeshBasicMaterial({ color: C("#FFA43A"), side: THREE.BackSide });
const outlineHover = new THREE.MeshBasicMaterial({ color: C("#1C1B19"), side: THREE.BackSide, transparent: true, opacity: 0.35 });
const solidMat = new THREE.MeshStandardMaterial({ color: C("#BEBEBE"), roughness: 0.82 });
const wireMat = new THREE.MeshBasicMaterial({ color: C("#151515"), wireframe: true });
const wireSel = new THREE.MeshBasicMaterial({ color: C("#FFA43A"), wireframe: true });

for (const p of PROJECTS) {
  const g = new THREE.Group();
  g.name = p.mesh; g.userData.project = p;
  const d = diorama(p); g.add(d); if (d.userData.updateTime) g.userData.updateTime = d.userData.updateTime; g.userData.liftParts = d.userData.liftParts;
  const [x, z, ry] = LAYOUT[p.id];
  g.position.set(x, 0, z); g.rotation.y = ry; g.userData.baseY = 0; g.userData.lift = 0;
  // outlines: an inverted hull per mesh, and stats
  let verts = 0, faces = 0;
  const meshes = [];
  g.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const m of meshes) {
    m.userData.mat = m.material;
    m.geometry.computeBoundingBox();
    const s = new THREE.Vector3(); m.geometry.boundingBox.getSize(s);
    const t = 0.022;
    if (d.userData.glb || m.userData.noOutline || (Math.max(s.x, s.y, s.z) < 0.14 && meshes.length > 6)) { m.userData.hull = { visible: false }; verts += m.geometry.attributes.position.count; faces += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3; continue; }
    const hull = new THREE.Mesh(m.geometry, outlineSel);
    hull.scale.set(...["x", "y", "z"].map(k => Math.min(1 + t / Math.max(s[k] / 2, 0.004), 3.2)));
    hull.visible = false; hull.userData.isHull = true;
    m.add(hull); m.userData.hull = hull;
    verts += m.geometry.attributes.position.count;
    faces += m.geometry.index ? m.geometry.index.count / 3 : m.geometry.attributes.position.count / 3;
  }
  g.userData.meshes = meshes;
  g.userData.stats = { verts, faces: Math.round(faces) };
  scene.add(g);
  objects.push(g);
}
// Selected-object origin dot
const origin = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshBasicMaterial({ color: C("#FFA43A"), depthTest: false }));
origin.renderOrder = 10; origin.visible = false; scene.add(origin);

/* ---------- State ---------- */
let selected = null, hovered = null, shading = "material";

function setHull(g, matOrNull) {
  for (const m of g.userData.meshes) {
    const h = m.userData.hull;
    h.visible = !!matOrNull && shading !== "wire";
    if (matOrNull) h.material = matOrNull;
  }
}
function refreshOutlines() {
  for (const g of objects) {
    if (localObj) setHull(g, null);
    else if (g === selected) setHull(g, outlineSel);
    else if (g === hovered) setHull(g, outlineHover);
    else setHull(g, null);
  }
}
function applyShading() {
  for (const g of objects) for (const m of g.userData.meshes) {
    m.material = shading === "material" ? m.userData.mat : shading === "solid" ? solidMat : (g === selected ? wireSel : wireMat);
    m.castShadow = shading !== "wire";
  }
  floor.visible = shading !== "wire";
  ["wire", "solid", "mat"].forEach(k => document.getElementById("s-" + k).setAttribute("aria-pressed", String((k === "mat" ? "material" : k) === shading)));
  refreshOutlines();
}
function setShading(s) { shading = s; applyShading(); }

/* ---------- Outliner ---------- */
const eyeSvg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8Z"/><circle cx="8" cy="8" r="2"/></svg>';
const outliner = document.getElementById("outliner");
outliner.innerHTML =
  `<li><span class="row coll"><span class="nm">Projects</span><span class="mesh">${PROJECTS.length}</span></span></li>` +
  PROJECTS.map(p => `<li id="ol-${p.id}"><button class="row" type="button" data-id="${p.id}"><span class="sw" style="background:${p.color}"></span><span class="nm">${p.name}</span></button><button class="eye" type="button" aria-pressed="true" aria-label="Hide ${p.name}" data-eye="${p.id}">${eyeSvg}</button></li>`).join("");
outliner.addEventListener("click", e => {
  const eye = e.target.closest("[data-eye]");
  if (eye) {
    const g = objects.find(o => o.userData.project.id === eye.dataset.eye);
    g.visible = !g.visible; g.userData.userHidden = !g.visible;
    eye.setAttribute("aria-pressed", String(g.visible));
    eye.setAttribute("aria-label", `${g.visible ? "Hide" : "Show"} ${g.userData.project.name}`);
    if (!g.visible && selected === g) select(null);
    return;
  }
  const row = e.target.closest("[data-id]");
  if (row) select(objects.find(o => o.userData.project.id === row.dataset.id), true);
});

/* ---------- Properties ---------- */
const props = document.getElementById("props");
const propsTitle = document.getElementById("props-title");
const fmt = n => (Math.abs(n) < 0.0005 ? 0 : n).toFixed(2);
function renderProps() {
  return; // project details now live on the full project page
  if (!selected) {
    propsTitle.innerHTML = "Scene properties <span>Shreyas Parat</span>";
    props.innerHTML = `
      <div class="box">
        <h3>About</h3>
        <p class="q">I'm a design engineer who builds the answers to <i>what if</i>.</p>
        <p class="prose">Each object on this table stands for a question I couldn't stop asking, and the app I built to answer it. I trained as a mechanical engineer, ran thermal simulations at General Motors, and have written my own iOS apps in Swift since 2020. Today I'm Product Lead at Five &amp; Done.</p>
      </div>
      <div class="box">
        <h3>Get around</h3>
        <p class="prose" style="margin-bottom:4px">Click an object to read its project here.</p>
        <ul class="keys">
          <li style="display:contents"><kbd>Click</kbd><span>Select an object</span></li>
          <li style="display:contents"><kbd>Drag</kbd><span>Pan across the meadow</span></li>
          <li style="display:contents"><kbd>F</kbd><span>Frame the selection</span></li>
          <li style="display:contents"><kbd>Home</kbd><span>Frame everything</span></li>
          <li style="display:contents"><kbd>1 3 7</kbd><span>Front, right, top views</span></li>
          <li style="display:contents"><kbd>Z</kbd><span>Cycle shading</span></li>
          <li style="display:contents"><kbd>Esc</kbd><span>Deselect</span></li>
        </ul>
      </div>`;
    return;
  }
  const g = selected, p = g.userData.project, d = DETAILS[p.id];
  const pi = PROJECTS.indexOf(p), prev = PROJECTS[(pi - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(pi + 1) % PROJECTS.length];
  const shipped = isShipped(p.status);
  propsTitle.innerHTML = `${p.name}`;
  props.innerHTML = `
    <div class="box">
      <h3>The question</h3>
      <p class="q">${p.q}</p>
      <p class="ans"><b>${p.name}</b>, ${d.answer}</p>
      <div class="field"><span class="k">Status</span><span class="v txt">${p.status}</span></div>
      <div class="field"><span class="k">Role</span><span class="v txt">${p.role}</span></div>
      <div class="field"><span class="k">Built with</span><span class="v txt">${p.built}</span></div>
    </div>
    <div class="box">
      <h3>The signal</h3>
      <p class="prose">${d.signal}</p>
    </div>
    <div class="box">
      <h3>How it's built</h3>
      <p class="prose">${d.build}</p>
      <button class="stepbtn" type="button" id="explode-btn" aria-pressed="${g.userData.explodeTarget === 1}" style="align-self:flex-start">${g.userData.explodeTarget === 1 ? "Put the model back together" : "Explode the model"}</button>
    </div>
    <div class="box">
      <h3>Design decisions</h3>
      <p class="prose">${d.design}</p>
      ${p.id === "allora" ? alloraSketch() : ""}
      <div class="swatches">${swatchesFor(g).map(h => `<div><span style="background:${h}"></span>${h}</div>`).join("")}</div>
    </div>
    <div class="box">
      <h3>Animatic</h3>
      <p class="prose">In production. It will play here once it's ready.</p>
    </div>
    <div class="box">
      <h3>${shipped ? "Shipped" : "Where it stands"}</h3>
      <div class="field"><span class="k">Status</span><span class="v txt">${p.status}</span></div>
      ${d.links.map(([t, u]) => `<div class="field"><span class="k">Link</span><span class="v txt"><a href="${u}">${t}</a></span></div>`).join("")}
    </div>
    <div class="box">
      <h3>What it taught me</h3>
      <p class="prose">${d.taught}</p>
    </div>
    <div class="steps">
      <button class="stepbtn" type="button" data-proj="${prev.id}">← ${prev.name}</button>
      <button class="stepbtn" type="button" data-proj="${next.id}">${next.name} →</button>
    </div>`;
  const ex = document.getElementById("explode-btn");
  ex.onclick = () => {
    const on = g.userData.explodeTarget !== 1;
    g.userData.explodeTarget = on ? 1 : 0;
    ex.setAttribute("aria-pressed", String(on));
    ex.textContent = on ? "Put the model back together" : "Explode the model";
  };
  props.querySelectorAll("[data-proj]").forEach(bn => bn.onclick = () => select(objects.find(o => o.userData.project.id === bn.dataset.proj), true));
  if (p.id === "allora") wireAlloraSketch();
}


/* ---------- Name signpost: behind the objects, opens the about page ---------- */
const nameSign = new THREE.Group();
{
  // forest-entrance style: a trapezoid wooden panel with routed lettering, on a stacked slate base
  const W = 4.4, H = W * 345 / 545, inset = 0.42, r = 0.16;
  const trap = (w, h, ins, rad) => {
    const pts = [[-w / 2, h / 2], [w / 2, h / 2], [w / 2 - ins, -h / 2], [-w / 2 + ins, -h / 2]], sh = new THREE.Shape(), V = p => new THREE.Vector2(p[0], p[1]);
    for (let i = 0; i < 4; i++) {
      const p0 = V(pts[(i + 3) % 4]), p1 = V(pts[i]), p2 = V(pts[(i + 1) % 4]);
      const a1 = p1.clone().add(p0.clone().sub(p1).normalize().multiplyScalar(rad)), b1 = p1.clone().add(p2.clone().sub(p1).normalize().multiplyScalar(rad));
      i ? sh.lineTo(a1.x, a1.y) : sh.moveTo(a1.x, a1.y); sh.quadraticCurveTo(p1.x, p1.y, b1.x, b1.y);
    }
    sh.closePath(); return sh;
  };
  const cv = document.createElement("canvas"); cv.width = 1100; cv.height = 696;
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
  const draw = () => {
    const x = cv.getContext("2d");
    x.fillStyle = "#5C3D27"; x.fillRect(0, 0, cv.width, cv.height);
    // boards and grain
    for (let k = 1; k < 4; k++) { x.fillStyle = "rgba(30, 18, 10, 0.35)"; x.fillRect(0, k * cv.height / 4 - 2, cv.width, 4); }
    let sd = 3; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 90; i++) { x.strokeStyle = `rgba(${rnd() > 0.5 ? "255,220,180" : "20,10,5"}, ${0.03 + rnd() * 0.05})`; x.lineWidth = 1 + rnd() * 3; x.beginPath(); let y = rnd() * cv.height; x.moveTo(0, y); for (let X = 0; X <= cv.width; X += 40) { y += (rnd() - 0.5) * 3; x.lineTo(X, y); } x.stroke(); }
    // bolts
    x.fillStyle = "#2A1B10"; for (const [bx, by] of [[260, 375], [900, 375], [330, 650], [860, 650]]) { x.beginPath(); x.arc(bx, by, 8, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = "#F1E6C8"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = '400 122px "Lilita One", "Outfit", sans-serif'; x.fillText("SHREYAS PARAT", 590, 285);
    x.font = '400 80px "Pacifico", cursive'; x.fillText("Design & Build", 590, 465, 680);
    tex.needsUpdate = true;
  };
  draw(); if (document.fonts) Promise.all([document.fonts.load('122px "Lilita One"'), document.fonts.load('80px "Pacifico"')]).then(draw, draw);
  const wood = new THREE.MeshStandardMaterial({ color: C("#4A3020"), flatShading: true, roughness: 0.85 });
  const shape = (() => {
    // USFS sign silhouette: top edge falls to the right, left side leans in steeply, right side only slightly, flat bottom
    const k = W / 545, P = (px, py, rad) => [(px - 312.5) * k, (222.5 - py) * k, rad * k];
    const pts = [P(40, 55, 22), P(585, 143, 22), P(552, 395, 26), P(122, 395, 30)];
    const sh = new THREE.Shape(), V = p => new THREE.Vector2(p[0], p[1]);
    for (let n = 0; n < 4; n++) {
      const p0 = V(pts[(n + 3) % 4]), p1 = V(pts[n]), p2 = V(pts[(n + 1) % 4]), rad = pts[n][2];
      const a1 = p1.clone().add(p0.clone().sub(p1).normalize().multiplyScalar(rad)), b1 = p1.clone().add(p2.clone().sub(p1).normalize().multiplyScalar(rad));
      n ? sh.lineTo(a1.x, a1.y) : sh.moveTo(a1.x, a1.y); sh.quadraticCurveTo(p1.x, p1.y, b1.x, b1.y);
    }
    sh.closePath(); return sh;
  })(), D = 0.18;
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.04, bevelSegments: 2, curveSegments: 6 }), wood);
  body.position.z = -D / 2; body.castShadow = true;
  const faceG = new THREE.ShapeGeometry(shape, 6);
  { const uv = faceG.attributes.uv, pos = faceG.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + W / 2) / W, (pos.getY(i) + H / 2) / H); }
  const face = new THREE.Mesh(faceG, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }));
  face.position.z = D / 2 + 0.031;
  const plank = new THREE.Group(); plank.add(body, face); plank.position.set(-0.55, 0.75 + H / 2 - 0.04, 0); plank.rotation.x = -0.05;
  for (const lx of [-0.8, 1.3]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.14), wood); leg.position.set(lx - 0.55, 0.45, 0); leg.castShadow = true; nameSign.add(leg); }
  nameSign.add(plank);
  nameSign.userData.plank = plank; nameSign.userData.plankY = plank.position.y;
  nameSign.position.set(0.55, 0, -6.6); nameSign.rotation.y = 0; // +0.55 cancels the plank's -0.55 offset: the panel sits on x = 0, the center of the 7-object layout
  nameSign.traverse(o => { if (o.isMesh) o.userData.isSign = true; });
  scene.add(nameSign);
}
const signRay = new THREE.Raycaster();
function pickSign(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  signRay.setFromCamera(ndc, camera);
  const hit = signRay.intersectObject(nameSign, true)[0];
  if (!hit) return false;
  const obj = pick(ev); if (!obj) return true;
  const ob = signRay.intersectObjects(objects, true).filter(h => !h.object.userData.isHull)[0];
  return !ob || hit.distance < ob.distance;
}
let signHover = false;

/* ---------- Selection ---------- */
const ovSel = document.getElementById("ov-sel");
const stStats = document.getElementById("st-stats");
function updateStatus() {
  const vis = objects.filter(o => o.visible);
  const s = selected ? selected.userData.stats : vis.reduce((a, o) => ({ verts: a.verts + o.userData.stats.verts, faces: a.faces + o.userData.stats.faces }), { verts: 0, faces: 0 });
  if (localObj) { stStats.innerHTML = `Local View | <b>${localObj.userData.project.name}</b> | ${WS_NAME[ws]} | Verts ${localObj.userData.stats.verts.toLocaleString()} | Tab or Esc to go back`; return; }
  stStats.innerHTML = `Projects${selected ? ` | <b>${selected.userData.project.name}</b>` : ""} | Verts ${s.verts.toLocaleString()} | Faces ${s.faces.toLocaleString()} | Objects ${selected ? 1 : 0}/${vis.length}`;
}
function select(g, frame = false) {
  if (selected && selected !== g) { selected.userData.explodeTarget = 0; }
  selected = g;
  document.querySelectorAll(".outliner li.sel").forEach(li => li.classList.remove("sel"));
  if (g) document.getElementById("ol-" + g.userData.project.id).classList.add("sel");
  ovSel.textContent = g ? `(1) Projects | ${g.userData.project.name}` : "(1) Projects";
  origin.visible = false;
  if (g) origin.position.copy(g.position);
  applyShading();
  renderProps();
  document.querySelector(".side").scrollTop = 0;
  updateStatus();
  if (g && frame) frameObject(g);
}

/* ---------- Camera moves ---------- */
let tween = null;
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// camera glide: approximates cubic-bezier(0.22, 1, 0.36, 1), a long, soft ease-out
const glide = t => 1 - Math.pow(1 - t, 4.2);
function moveCamera(pos, target, label) {
  if (label) setViewLabel(label);
  if (reduceMotion) { camera.position.copy(pos); controls.target.copy(target); controls.update(); return; }
  tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), start: performance.now(), dur: 1400 };
}
function frameObject(g) {
  const b = new THREE.Box3().setFromObject(g);
  const center = b.getCenter(new THREE.Vector3());
  const size = b.getSize(new THREE.Vector3()).length();
  const dir = camera.position.clone().sub(controls.target).normalize();
  moveCamera(center.clone().add(dir.multiplyScalar(Math.max(size * 1.9, 3.2))), center, "User Perspective");
}
function frameAll() { moveCamera(HOME.pos, HOME.target, "User Perspective"); }
function viewAlong(dir, label) {
  const t = new THREE.Vector3(0, 0.45, -0.3), d = 15;
  const p = t.clone().add(dir.clone().normalize().multiplyScalar(d));
  if (Math.abs(dir.y) > 0.99) p.z += 0.001;
  moveCamera(p, t, label);
}
const ovView = document.getElementById("ov-view");
function setViewLabel(label) {
  ovView.textContent = label;
  const map = { "User Perspective": "persp", "Front Orthographic": "front", "Right Orthographic": "right", "Top Orthographic": "top" };
  ["persp", "front", "right", "top"].forEach(k => document.getElementById("v-" + k).setAttribute("aria-pressed", String(map[label] === k)));
}
controls.addEventListener("start", () => { tween = null; if (ovView.textContent !== "User Perspective") setViewLabel("User Perspective"); });

document.getElementById("v-persp").onclick = frameAll;
document.getElementById("v-front").onclick = () => viewAlong(new THREE.Vector3(0, 0.12, 1), "Front Orthographic");
document.getElementById("v-right").onclick = () => viewAlong(new THREE.Vector3(1, 0.12, 0), "Right Orthographic");
document.getElementById("v-top").onclick = () => viewAlong(new THREE.Vector3(0, 1, 0), "Top Orthographic");
document.getElementById("frame-sel").onclick = () => (selected ? frameObject(selected) : frameAll());
document.getElementById("frame-all").onclick = frameAll;
document.getElementById("s-wire").onclick = () => setShading("wire");
document.getElementById("s-solid").onclick = () => setShading("solid");
document.getElementById("s-mat").onclick = () => setShading("material");

addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (sheetOpen) { if (e.key === "Escape") { e.preventDefault(); closeProject(); } return; }
  const k = e.key;
  if (k === "f" || k === "F" || k === ".") { selected ? frameObject(selected) : frameAll(); }
  else if (k === "Home") frameAll();
  else if (k === "1") document.getElementById("v-front").click();
  else if (k === "3") document.getElementById("v-right").click();
  else if (k === "7") document.getElementById("v-top").click();
  else if (k === "z" || k === "Z") setShading({ material: "solid", solid: "wire", wire: "material" }[shading]);
  else if (k === "Escape") select(null);
  else return;
  e.preventDefault();
});

/* ---------- Picking ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(objects.filter(o => o.visible), true).filter(h => !h.object.userData.isHull);
  if (!hits.length) return null;
  let o = hits[0].object;
  while (o && !o.userData.project) o = o.parent;
  return o;
}
let down = null;
canvas.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener("pointerup", e => {
  if (!down || e.button !== 0) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  down = null;
  if (moved < 5 && !localObj) { if (pickSign(e)) { location.hash = "about"; return; } const g = pick(e); if (g) openProject(g); else select(null); }
});
canvas.addEventListener("dblclick", e => { const g = pick(e); if (g) openProject(g); });
let hoverQueued = null;
canvas.addEventListener("pointermove", e => {
  if (e.pointerType !== "mouse") return;
  hoverQueued = e;
});

/* ---------- Gizmo ---------- */
const gz = document.getElementById("gizmo"), gctx = gz.getContext("2d");
const AXES = [
  { v: new THREE.Vector3(1, 0, 0), c: "#E8475A", l: "X" },
  { v: new THREE.Vector3(0, 0, -1), c: "#7DB83A", l: "Y" },
  { v: new THREE.Vector3(0, 1, 0), c: "#3F86E0", l: "Z" }
];
let gzHits = [];
function drawGizmo() {
  const dpr = Math.min(devicePixelRatio, 2), S = 96;
  if (gz.width !== S * dpr) { gz.width = S * dpr; gz.height = S * dpr; }
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  gctx.clearRect(0, 0, S, S);
  const inv = camera.quaternion.clone().invert(), cx = S / 2, cy = S / 2, R = 32;
  const items = [];
  for (const a of AXES) for (const sign of [1, -1]) {
    const p = a.v.clone().multiplyScalar(sign).applyQuaternion(inv);
    items.push({ x: cx + p.x * R, y: cy - p.y * R, z: p.z, a, sign, dir: a.v.clone().multiplyScalar(sign) });
  }
  items.sort((m, n) => m.z - n.z);
  gzHits = items;
  for (const it of items) {
    if (it.sign > 0) { gctx.strokeStyle = it.a.c; gctx.lineWidth = 2; gctx.beginPath(); gctx.moveTo(cx, cy); gctx.lineTo(it.x, it.y); gctx.stroke(); }
    gctx.beginPath(); gctx.arc(it.x, it.y, it.sign > 0 ? 9 : 7, 0, Math.PI * 2);
    gctx.fillStyle = it.sign > 0 ? it.a.c : it.a.c + "55"; gctx.fill();
    if (it.sign < 0) { gctx.strokeStyle = it.a.c; gctx.lineWidth = 1.2; gctx.stroke(); }
    if (it.sign > 0) { gctx.fillStyle = "#151515"; gctx.font = "600 10px IBM Plex Sans, sans-serif"; gctx.textAlign = "center"; gctx.textBaseline = "middle"; gctx.fillText(it.a.l, it.x, it.y + 0.5); }
  }
}
gz.addEventListener("click", e => {
  const r = gz.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  let best = null, bd = 14;
  for (const it of gzHits) { const d = Math.hypot(it.x - x, it.y - y); if (d < bd) { bd = d; best = it; } }
  if (!best) return;
  const names = { X: "Right", Y: "Back", Z: "Top" }, neg = { X: "Left", Y: "Front", Z: "Bottom" };
  viewAlong(best.dir, `${best.sign > 0 ? names[best.a.l] : neg[best.a.l]} Orthographic`);
});


/* ---------- Local View: one project, five workspaces ---------- */
const WS = ["layout", "modeling", "shading", "animation", "rendering"];
const WS_NAME = { layout: "Layout", modeling: "Modeling", shading: "Shading", animation: "Animation", rendering: "Rendering" };
let localObj = null, ws = "layout", sceneView = null, playing = false, frame = 1, phoneShift = 0;
const work = document.querySelector(".work");
const wsNav = document.getElementById("ws");
const phone = document.getElementById("phone"), timeline = document.getElementById("timeline"), renderframe = document.getElementById("renderframe"), localchip = document.getElementById("localchip");

// exploded-view bookkeeping: each top-level part gets a direction away from the object's center
for (const g of objects) {
  g.updateMatrixWorld(true);
  const center = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
  const cLocal = g.worldToLocal(center.clone());
  g.userData.explode = 0; g.userData.explodeTarget = 0; g.userData.baseRotY = g.rotation.y;
  for (const ch of g.children) {
    const b = new THREE.Box3().setFromObject(ch);
    if (b.isEmpty()) continue;
    const pc = g.worldToLocal(b.getCenter(new THREE.Vector3()));
    const dir = pc.sub(cLocal); dir.y = dir.y * 1.4 + 0.08;
    if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
    ch.userData.home = ch.position.clone();
    ch.userData.dir = dir.normalize();
  }
  g.userData.parts = g.children.length;
}

function swatchesFor(g) {
  const seen = new Map();
  for (const m of g.userData.meshes) { const mm = m.userData.mat; if (mm && mm.color && !mm.transparent) seen.set("#" + mm.color.getHexString().toUpperCase(), (seen.get("#" + mm.color.getHexString().toUpperCase()) || 0) + 1); }
  // colors are stored linear; convert for display
  return [...seen.keys()].slice(0, 8);
}

function openProject(g) { if (g) location.hash = g.userData.project.id; }
function closeProject() { if (location.hash) history.pushState("", document.title, location.pathname + location.search); applyRoute(false); }

function enterLocal(g, instant) {
  if (!localObj) sceneView = { pos: camera.position.clone(), target: controls.target.clone() };
  if (localObj && localObj !== g) leaveLocalObject(localObj);
  localObj = g;
  if (selected !== g) select(g);
  for (const o of objects) o.visible = o === g;
  origin.visible = false; phoneShift = 0;
  refreshOutlines();
  work.classList.add("local"); wsNav.hidden = false; localchip.hidden = false;
  ovView.textContent = "User Perspective (Local)";
  const b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()).length();
  const dir = new THREE.Vector3(0.62, 0.46, 0.64).normalize();
  const pos = c.clone().add(dir.multiplyScalar(Math.max(size * 2.1, 3.4)));
  requestAnimationFrame(() => { resize(); if (instant || reduceMotion) { camera.position.copy(pos); controls.target.copy(c); controls.update(); } else moveCamera(pos, c); });
  setWorkspace("layout");
}
function leaveLocalObject(g) {
  g.rotation.y = g.userData.baseRotY; g.userData.explode = 0; g.userData.explodeTarget = 0; applyExplode(g);
}
function exitLocal() {
  if (!localObj) return;
  const g = localObj; localObj = null; playing = false;
  leaveLocalObject(g);
  for (const o of objects) o.visible = !o.userData.userHidden;
  work.classList.remove("local"); wsNav.hidden = true; localchip.hidden = true;
  phone.hidden = true; timeline.hidden = true; renderframe.hidden = true; grid.visible = fine.visible = true;
  setViewLabel("User Perspective");
  requestAnimationFrame(() => { resize(); const v = sceneView || HOME; moveCamera(v.pos, v.target); });
  select(g);
}
function applyRoute(initial) {
  const id = location.hash.replace("#", "");
  if (id === "about") { if (selected) select(null); showAbout(initial === true); return; }
  const g = objects.find(o => o.userData.project.id === id);
  if (g) { if (g !== selected) select(g, true); showSheet(g, initial === true); }
  else { hideSheet(); if (selected && !initial) select(null); }
}
addEventListener("hashchange", () => applyRoute(false));
// "List view" sign: carries the current page across, so /list opens on the same project (or the about page)
const viewToggle = document.getElementById("view-toggle");
// Only on the meadow home: hidden once a project or the about page is open.
function syncViewToggle() { if (viewToggle) viewToggle.style.display = location.hash.length > 1 ? "none" : ""; }
addEventListener("hashchange", syncViewToggle); syncViewToggle();

function applyExplode(g) {
  for (const ch of g.children) if (ch.userData.home) ch.position.copy(ch.userData.home).addScaledVector(ch.userData.dir, g.userData.explode * 0.55);
}

function setWorkspace(next) {
  ws = next;
  WS.forEach(k => document.getElementById("ws-" + k).setAttribute("aria-selected", String(k === ws)));
  const g = localObj; if (!g) return;
  g.userData.explodeTarget = ws === "modeling" ? 1 : 0;
  const showPhone = ws === "shading" && g.userData.project.id === "allora";
  phone.hidden = !showPhone;
  const want = showPhone && viewport.clientWidth > 700 ? 0.95 : 0;
  if (want !== phoneShift) {
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0), d = want - phoneShift;
    phoneShift = want;
    moveCamera(camera.position.clone().addScaledVector(right, d), controls.target.clone().addScaledVector(right, d));
  }
  timeline.hidden = ws !== "animation";
  renderframe.hidden = ws !== "rendering";
  grid.visible = fine.visible = ws !== "rendering";
  if (ws !== "animation") { playing = false; setPlay(false); }
  if (ws === "shading" || ws === "rendering") setShading("material");
  renderLocalPanel();
}
WS.forEach(k => document.getElementById("ws-" + k).addEventListener("click", () => setWorkspace(k)));

function renderLocalPanel() {
  const g = localObj, p = g.userData.project, d = DETAILS[p.id], i = WS.indexOf(ws);
  const others = PROJECTS.map(x => x.id), pi = others.indexOf(p.id);
  const prev = PROJECTS[(pi - 1 + others.length) % others.length], next = PROJECTS[(pi + 1) % others.length];
  propsTitle.innerHTML = `${p.name} <span>${WS_NAME[ws]}</span>`;
  let body = "";
  if (ws === "layout") body = `
    <div class="box">
      <h3>The question</h3>
      <p class="q">${p.q}</p>
      <p class="ans"><b>${p.name}</b>, ${d.answer}</p>
    </div>
    <div class="box">
      <h3>The signal</h3>
      <p class="prose">${d.signal}</p>
    </div>
    <div class="box">
      <div class="field"><span class="k">Status</span><span class="v txt">${p.status}</span></div>
      <div class="field"><span class="k">Role</span><span class="v txt">${p.role}</span></div>
      <div class="field"><span class="k">Built with</span><span class="v txt">${p.built}</span></div>
    </div>`;
  if (ws === "modeling") body = `
    <div class="box">
      <h3>How it's built</h3>
      <p class="prose">${d.build}</p>
    </div>
    <div class="box">
      <h3>Exploded view</h3>
      <p class="prose">The ${p.mesh} model is pulled apart into its ${g.userData.parts} parts. Drag to look around it.</p>
      <div class="field"><span class="k">Mesh</span><span class="v txt">${p.mesh}</span></div>
      <div class="field"><span class="k">Verts</span><span class="v">${g.userData.stats.verts.toLocaleString()}</span></div>
      <div class="field"><span class="k">Faces</span><span class="v">${g.userData.stats.faces.toLocaleString()}</span></div>
    </div>`;
  if (ws === "shading") body = `
    <div class="box">
      <h3>Design decisions</h3>
      <p class="prose">${d.design}</p>
    </div>
    <div class="box">
      <h3>Materials on this object</h3>
      <div class="swatches">${swatchesFor(g).map(h => `<div><span style="background:${h}"></span>${h}</div>`).join("")}</div>
    </div>`;
  if (ws === "animation") body = `
    <div class="box">
      <h3>Animatic</h3>
      <p class="prose">The ${p.name} animatic is in production. Until it's ready, the timeline scrubs a turntable of the object. Press Play, or drag the playhead.</p>
    </div>`;
  if (ws === "rendering") body = `
    <div class="box">
      <h3>${isShipped(p.status) ? "Shipped" : "Where it stands"}</h3>
      <div class="field"><span class="k">Status</span><span class="v txt">${p.status}</span></div>
      ${d.links.map(([t, u]) => `<div class="field"><span class="k">Link</span><span class="v txt"><a href="${u}">${t}</a></span></div>`).join("")}
    </div>
    <div class="box">
      <h3>What it taught me</h3>
      <p class="prose">${d.taught}</p>
    </div>`;
  props.innerHTML = `
    <div class="crumb"><button type="button" id="lv-back">← All projects</button><span style="color:var(--muted);font-size:12px">${i + 1} of 5</span></div>
    ${body}
    <div class="steps">
      ${i > 0 ? `<button class="stepbtn" type="button" data-ws="${WS[i - 1]}">← ${WS_NAME[WS[i - 1]]}</button>` : `<button class="stepbtn" type="button" data-proj="${prev.id}">← ${prev.name}</button>`}
      ${i < 4 ? `<button class="stepbtn" type="button" data-ws="${WS[i + 1]}">${WS_NAME[WS[i + 1]]} →</button>` : `<button class="stepbtn" type="button" data-proj="${next.id}">${next.name} →</button>`}
    </div>`;
  document.getElementById("lv-back").onclick = closeProject;
  props.querySelectorAll("[data-ws]").forEach(b => b.onclick = () => setWorkspace(b.dataset.ws));
  props.querySelectorAll("[data-proj]").forEach(b => b.onclick = () => { location.hash = b.dataset.proj; });
  props.scrollTop = 0;
  updateStatus();
}

// Timeline
const tlRange = document.getElementById("tl-range"), tlFr = document.getElementById("tl-fr"), tlPlay = document.getElementById("tl-play");
function setPlay(on) { playing = on; tlPlay.textContent = on ? "Pause" : "Play"; tlPlay.setAttribute("aria-pressed", String(on)); }
tlPlay.onclick = () => setPlay(!playing);
tlRange.oninput = () => { setPlay(false); frame = +tlRange.value; };




/* ---------- Project page ("render" of the selected object) ---------- */
const sheet = document.getElementById("sheet"), shBody = document.getElementById("sh-body"), shBand = document.getElementById("sh-band"), shCrumb = document.getElementById("sh-crumb");
let sheetOpen = false, sheetSince = 0, sheetTimer = null;
document.getElementById("pcount").textContent = PROJECTS.length;

// project list in the sidebar
const plist = document.getElementById("plist");
plist.innerHTML = PROJECTS.map(p => `<li><button type="button" data-id="${p.id}" aria-current="false"><span class="sign r"><span><i style="background:${p.color}"></i>${p.name}</span></span></button></li>`).join("");
plist.addEventListener("click", e => { const b = e.target.closest("button[data-id]"); if (b) openProject(objects.find(o => o.userData.project.id === b.dataset.id)); });
plist.addEventListener("pointerover", e => {
  if (e.pointerType !== "mouse") return;
  const b = e.target.closest("button[data-id]"); const g = b ? objects.find(o => o.userData.project.id === b.dataset.id) : null;
  if (g !== hovered) { hovered = g; refreshOutlines(); }
});
plist.addEventListener("pointerleave", () => { hovered = null; refreshOutlines(); });

// Mobile meadow project strip
const meadowStrip = document.getElementById("meadow-strip");
if (meadowStrip) {
  meadowStrip.innerHTML = PROJECTS.map(p =>
    '<button type="button" class="ms-btn" data-id="' + p.id + '">' +
    '<span class="ms-name">' + p.name + '</span>' +
    '</button>'
  ).join("");
  meadowStrip.addEventListener("click", e => {
    const b = e.target.closest("button[data-id]");
    if (b) openProject(objects.find(o => o.userData.project.id === b.dataset.id));
  });
}

// a small live turntable of the object for the page header
const mini = { canvas: document.createElement("canvas"), r: null, scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(28, 1, 0.1, 60), holder: new THREE.Group(), obj: null };
mini.scene.environment = scene.environment;
mini.scene.add(new THREE.HemisphereLight("#fff8ee", "#8a8172", 0.4));
{ const d = new THREE.DirectionalLight("#ffffff", 1.25); d.position.set(3, 6, 5); mini.scene.add(d); }
mini.scene.add(mini.holder);
mini.canvas.setAttribute("aria-hidden", "true");
function setMiniObject(g) {
  if (!mini.r) { mini.r = new THREE.WebGLRenderer({ canvas: mini.canvas, antialias: true, alpha: true }); mini.r.outputEncoding = THREE.sRGBEncoding; mini.r.setPixelRatio(Math.min(devicePixelRatio, 2)); }
  if (mini.obj) mini.holder.remove(mini.obj);
  const c = g.clone(true);
  c.position.set(0, 0, 0); c.rotation.set(0, 0, 0);
  c.traverse(o => { if (o.userData && o.userData.isHull) o.visible = false; if (o.userData && o.userData.home) o.position.copy(o.userData.home); });
  const b = new THREE.Box3().setFromObject(c), center = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()).length();
  c.position.sub(center);
  mini.obj = c; mini.holder.add(c); mini.holder.rotation.y = 0.6;
  mini.cam.position.set(0, size * 0.55, size * 2.15); mini.cam.lookAt(0, 0, 0);
}


/* ---------- Fog of war: rolls in over the meadow before a page opens, and lifts when it closes ---------- */
const fogEl = document.createElement("div"); fogEl.id = "fog"; fogEl.setAttribute("aria-hidden", "true");
const fogCv = document.createElement("canvas"); fogEl.appendChild(fogCv);
document.body.appendChild(fogEl);
// Generative fog: domain-warped fBm, lit from above, that advances from the edges toward the clicked object.
const fogGL = (() => {
  const gl = fogCv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const vs = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const fs = `precision highp float;
uniform vec2 uRes; uniform vec2 uCenter; uniform float uTime; uniform float uCover;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
const mat2 R = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = R * p; a *= 0.5; } return v; }
float density(vec2 p, float t){
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t * 0.05), fbm(p + vec2(5.2, 1.3) - t * 0.04));
  vec2 r = vec2(fbm(p + 1.6 * q + vec2(1.7, 9.2) + t * 0.06), fbm(p + 1.6 * q + vec2(8.3, 2.8) - t * 0.05));
  return fbm(p + 1.3 * r);
}
void main(){
  vec2 px = gl_FragCoord.xy, uv = px / uRes.y, c = uCenter / uRes.y;
  vec2 toC = c - uv; float d = length(toC) / (length(uRes) / uRes.y);
  float t = uTime;
  // the fog billows inward as it advances
  vec2 p = uv * 1.5 + vec2(t * 0.04, t * 0.012) + toC * uCover * 0.35;
  float n = density(p, t) * 0.75 + fbm(uv * 6.0 + vec2(t * 0.09, -t * 0.03)) * 0.25;
  float nl = density(p + vec2(-0.05, 0.06), t) * 0.75 + fbm(uv * 6.0 + vec2(-0.05, 0.06) * 4.0 + vec2(t * 0.09, -t * 0.03)) * 0.25;
  float edge = mix(1.25, -0.35, uCover);
  float wisp = (n - 0.5) * 1.1;
  float a = smoothstep(edge - 0.38, edge + 0.12, d + wisp);
  a *= 0.6 + 0.6 * smoothstep(0.3, 0.7, n);
  a = mix(a, 1.0, smoothstep(0.82, 1.0, uCover));
  a = clamp(a, 0.0, 1.0);
  float lit = clamp(0.55 + (n - nl) * 2.6, 0.0, 1.0);
  vec3 shadow = vec3(0.9, 0.87, 0.82), light = vec3(1.0, 0.993, 0.975), base = vec3(0.969, 0.949, 0.918);
  vec3 col = mix(shadow, light, lit);
  col = mix(col, base, smoothstep(0.85, 1.0, uCover) * 0.85);
  gl_FragColor = vec4(col * a, a);
}`;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n), uRes = U("uRes"), uCenter = U("uCenter"), uTime = U("uTime"), uCover = U("uCover");
  const state = { cover: 0, cx: innerWidth / 2, cy: innerHeight / 2, raf: 0, t0: performance.now() };
  const scale = () => Math.min(devicePixelRatio || 1, 2) * 0.5;
  const draw = now => {
    const k = scale(), w = Math.max(1, Math.round(innerWidth * k)), h = Math.max(1, Math.round(innerHeight * k));
    if (fogCv.width !== w || fogCv.height !== h) { fogCv.width = w; fogCv.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h); gl.uniform2f(uCenter, state.cx * k, h - state.cy * k);
    gl.uniform1f(uTime, reduceMotion ? 0 : (now - state.t0) / 1000); gl.uniform1f(uCover, state.cover);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = now => { draw(now); state.raf = state.cover > 0.001 ? requestAnimationFrame(loop) : 0; if (!state.raf) gl.clear(gl.COLOR_BUFFER_BIT); };
  state.kick = () => { if (!state.raf) state.raf = requestAnimationFrame(loop); };
  return state;
})();
const FOG0 = { near: scene.fog.near, far: scene.fog.far, color: scene.fog.color.clone() }, FOG_IN_COLOR = new THREE.Color("#F7F2EA");
let fogAnim = null;
function sceneFogTo(near, far, dur) {
  const from = { near: scene.fog.near, far: scene.fog.far, color: scene.fog.color.clone() }, t0 = performance.now(), toC = near === FOG0.near ? FOG0.color : FOG_IN_COLOR;
  cancelAnimationFrame(fogAnim);
  const step = now => { const t = dur ? Math.min((now - t0) / dur, 1) : 1, k = ease(t);
    scene.fog.near = from.near + (near - from.near) * k; scene.fog.far = from.far + (far - from.far) * k; scene.fog.color.copy(from.color).lerp(toC, k);
    if (t < 1) fogAnim = requestAnimationFrame(step); };
  fogAnim = requestAnimationFrame(step);
}
function fogIn(at, instant) {
  if (at) { const p = at.clone().project(camera), r = renderer.domElement.getBoundingClientRect();
    if (fogGL) { fogGL.cx = r.left + (p.x + 1) / 2 * r.width; fogGL.cy = r.top + (1 - p.y) / 2 * r.height; } }
  fogEl.classList.remove("leaving"); fogEl.classList.add("on");
  const quick = instant || reduceMotion;
  fogRadius(0, quick ? 0 : 1400); sceneFogTo(1, 12, quick ? 0 : 1300);
}
let fogR = 170, fogRAF = null;
function fogRadius(to, dur) {
  const from = fogR, t0 = performance.now();
  cancelAnimationFrame(fogRAF);
  const step = now => { const t = dur ? Math.min((now - t0) / dur, 1) : 1, k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    fogR = from + (to - from) * k; if (fogGL) { fogGL.cover = 1 - fogR / 170; fogGL.kick(); }
    if (t < 1) fogRAF = requestAnimationFrame(step); };
  if (!dur) step(t0); else fogRAF = requestAnimationFrame(step);
}
function fogOut() {
  if (!fogEl.classList.contains("on")) return;
  fogEl.classList.remove("on"); fogEl.classList.add("leaving");
  fogRadius(170, reduceMotion ? 0 : 1400);
  sceneFogTo(FOG0.near, FOG0.far, reduceMotion ? 0 : 1100);
  clearTimeout(fogOut.t); fogOut.t = setTimeout(() => fogEl.classList.remove("leaving"), reduceMotion ? 0 : 1100);
}
const FOG_DELAY = 1250;

function showSheet(g, instant) {
  const p = g.userData.project;
  clearTimeout(sheetTimer);
  const fill = () => {
    shBand.style.background = p.color;
    shCrumb.textContent = p.name;
    shBody.innerHTML = sheetHTML(p);
    if (p.id === "allora") wireAlloraSketch();
    wireDots();
    sheet.scrollTop = 0;
    sheet.setAttribute("aria-hidden", "false");
    sheet.classList.add("is-open");
    sheetOpen = true; sheetSince = performance.now();
    sheet.focus({ preventScroll: true });
  };
  if (instant || reduceMotion || sheetOpen) { fogIn(new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3()), true); fill(); }
  else { fogIn(new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3())); sheetTimer = setTimeout(fill, FOG_DELAY); }
}
function showAbout(instant) {
  clearTimeout(sheetTimer);
  const fill = () => {
    shCrumb.textContent = "About";
    shBody.innerHTML = aboutHTML();
    wireAbout();
    sheet.scrollTop = 0;
    sheet.setAttribute("aria-hidden", "false");
    sheet.classList.add("is-open");
    sheetOpen = true; sheetSince = performance.now();
    sheet.focus({ preventScroll: true });
  };
  const at = new THREE.Box3().setFromObject(nameSign).getCenter(new THREE.Vector3());
  if (instant || reduceMotion || sheetOpen) { fogIn(at, true); fill(); }
  else { fogIn(at); sheetTimer = setTimeout(fill, FOG_DELAY); }
}
function hideSheet() {
  clearTimeout(sheetTimer);
  if (!sheetOpen) { fogOut(); return; }
  setTimeout(fogOut, reduceMotion ? 0 : 260);
  sheetOpen = false;
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
}

/* ---------- Loop ---------- */
function resize() {
  const w = viewport.clientWidth, h = viewport.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w / h < 1 ? 58 : 38;
  // on desktop the panel floats over the right side, so center the scene in the open area to its left
  const panel = 0;
  if (panel) camera.setViewOffset(w + panel, h, panel, 0, w, h); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);
resize();

const clock = objects.find(o => o.userData.project.id === "allora");
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
function tick(now) {
  if (tween) {
    const t = Math.min((now - tween.start) / tween.dur, 1), k = glide(t);
    camera.position.lerpVectors(tween.p0, tween.p1, k);
    controls.target.lerpVectors(tween.t0, tween.t1, k);
    if (t >= 1) tween = null;
  }
  controls.update();
  // stay in the meadow: the view can't wander past the treeline or sink into the hills
  {
    const T = controls.target, rr = Math.hypot(T.x, T.z), LIM = 9;
    if (rr > LIM) { const k = LIM / rr, dx = T.x * k - T.x, dz = T.z * k - T.z; T.x += dx; T.z += dz; camera.position.x += dx; camera.position.z += dz; }
    const floorY = terrainY(camera.position.x, camera.position.z) + 1.4;
    if (camera.position.y < floorY) camera.position.y = floorY;
  }
  // time-of-day environment (resampled every 30 s, applied each frame via lerp)
  const hourOverride = typeof window.__HOUR === 'number';
  const needsResample = !envBooted || now - lastEnvSample > 30000 || (hourOverride && window.__HOUR !== window.__HOUR_APPLIED);
  if (needsResample) {
    const envNow = new Date();
    const envHour = hourOverride ? window.__HOUR : envNow.getHours() + envNow.getMinutes() / 60;
    envTarget = getEnvAt(envHour);
    FOG0.near = envTarget.fogNear; FOG0.far = envTarget.fogFar; FOG0.color.copy(envTarget.fogColor);
    lastEnvSample = now;
    if (hourOverride) window.__HOUR_APPLIED = window.__HOUR;
  }
  applyEnv(!envBooted || (hourOverride && needsResample) ? 1.0 : 0.004);
  if (!envBooted) envBooted = true;
  // the clock keeps real time
  const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
  if (clock.userData.updateTime) clock.userData.updateTime(d);
  for (const o of objects) {
    const ud = o.userData, want = (o === hovered && canHover && !sheetOpen) ? 0.28 : 0;
    ud.lift += (want - ud.lift) * (reduceMotion ? 1 : 0.15);
    if (ud.liftParts && ud.liftParts.length) { for (const lp of ud.liftParts) lp.o.position.copy(lp.p0).addScaledVector(lp.d, ud.lift); }
    else o.position.y = ud.baseY + ud.lift;
  }
  for (const o of objects) {
    const ud = o.userData;
    if (Math.abs(ud.explode - ud.explodeTarget) > 0.001) { ud.explode += (ud.explodeTarget - ud.explode) * (reduceMotion ? 1 : 0.12); if (Math.abs(ud.explode - ud.explodeTarget) <= 0.001) ud.explode = ud.explodeTarget; applyExplode(o); }
  }
  if (localObj) {
    const g = localObj, ud = g.userData;
    if (Math.abs(ud.explode - ud.explodeTarget) > 0.001) { ud.explode += (ud.explodeTarget - ud.explode) * (reduceMotion ? 1 : 0.12); applyExplode(g); }
    if (ws === "animation") {
      if (playing) { frame = frame >= 240 ? 1 : frame + 1; tlRange.value = frame; }
      tlFr.textContent = `Frame ${frame}`;
      g.rotation.y = ud.baseRotY + ((frame - 1) / 240) * Math.PI * 2;
    } else if (!reduceMotion && ws !== "modeling") g.rotation.y += 0.0035;
  }
  { const pl = nameSign.userData.plank, want = signHover && canHover && !sheetOpen ? 1 : 0;
    nameSign.userData.h = (nameSign.userData.h || 0) + (want - (nameSign.userData.h || 0)) * (reduceMotion ? 1 : 0.15);
    pl.position.y = nameSign.userData.plankY + nameSign.userData.h * 0.1; }
  if (hoverQueued) {
    const sh = pickSign(hoverQueued);
    const g = sh ? null : pick(hoverQueued); hoverQueued = null;
    signHover = sh;
    if (g !== hovered) { hovered = g; refreshOutlines(); }
    canvas.style.cursor = g || sh ? "pointer" : "";
  }
  if (!(sheetOpen && now - sheetSince > 700)) renderer.render(scene, camera);
  if (sheetOpen && mini.obj) { if (!reduceMotion) mini.holder.rotation.y += 0.008; mini.r.render(mini.scene, mini.cam); }
  if (!gz.hidden) drawGizmo();
  requestAnimationFrame(tick);
}
let booted = false;
select(null);
applyRoute(true);
booted = true;
requestAnimationFrame(tick);
window.__dbg = { THREE, camera, controls, objects, scene };

/* ---------- Controls hint: game-style tutorial prompts that tick off as you use them ---------- */
(function() {
  const hint = document.getElementById('ctrl-hint');
  if (!hint) return;
  const KEY = 'ctrl-hint-dismissed';
  try { if (sessionStorage.getItem(KEY) === '1') { hint.remove(); return; } } catch (e) {}
  // Mouse glyph; the active part (left / right button or wheel) carries .hl so CSS can pulse it like a press
  const M = (part) =>
    '<svg class="ctrl-mouse" viewBox="0 0 22 32" width="15" height="22" fill="none" aria-hidden="true">' +
    '<rect x="1.5" y="1.5" width="19" height="29" rx="9.5" stroke="currentColor" stroke-width="1.6"/>' +
    '<line x1="11" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="1.2" opacity=".3"/>' +
    '<line x1="2" y1="13" x2="20" y2="13" stroke="currentColor" stroke-width="1.2" opacity=".3"/>' +
    (part === 'l' ? '<path class="hl" d="M2.3 13V10.5A8.7 8.7 0 0 1 11 2.3V13Z" fill="currentColor"/>' : '') +
    (part === 'r' ? '<path class="hl" d="M19.7 13V10.5A8.7 8.7 0 0 0 11 2.3V13Z" fill="currentColor"/>' : '') +
    '<rect class="' + (part === 's' ? 'hl' : '') + '" x="9.4" y="5" width="3.2" height="6" rx="1.6" fill="currentColor" opacity="' + (part === 's' ? '1' : '.35') + '"/>' +
    '</svg>';
  const CHECK = '<svg class="ctrl-check" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const steps = [
    ['click', 'l', 'Click',      'an object', ''],
    ['drag',  'l', 'Drag',       'to pan',    'h'],
    ['spin',  'r', 'Right-drag', 'to spin',   ''],
    ['zoom',  's', 'Scroll',     'to zoom',   'v'],
  ];
  hint.innerHTML =
    '<div class="ctrl-head"><span class="ctrl-title">Controls</span>' +
    '<span class="ctrl-count" aria-live="polite"><b>0</b>/' + steps.length + '</span>' +
    '<button type="button" class="ctrl-close" aria-label="Dismiss controls">' +
    '<svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
    '</button></div><div class="ctrl-items">' +
    steps.map(([id, part, action, sub, dir], i) =>
      '<span class="ctrl-item" data-step="' + id + '" style="--i:' + i + '">' +
      '<span class="ctrl-key' + (dir ? ' move-' + dir : '') + '">' + M(part) + CHECK + '</span>' +
      '<span class="ctrl-action">' + action + '</span><span class="ctrl-sub">' + sub + '</span></span>').join('') +
    '</div>';

  const count = hint.querySelector('.ctrl-count b');
  const done = new Set();
  const complete = (id) => {
    if (done.has(id) || !hint.isConnected) return;
    done.add(id);
    hint.querySelector('[data-step="' + id + '"]').classList.add('is-done');
    count.textContent = done.size;
    if (done.size === steps.length) hint.classList.add('is-complete');
  };

  // Watch what the visitor actually does on the canvas
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, b: e.button, moved: false }; });
  canvas.addEventListener('pointermove', e => {
    if (!down || down.moved) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) {
      down.moved = true;
      complete(down.b === 2 ? 'spin' : 'drag');
    }
  });
  canvas.addEventListener('pointerup', () => {
    if (down && !down.moved && down.b === 0) {
      setTimeout(() => {
        const sheet = document.getElementById('sheet');
        if (selected || (sheet && sheet.classList.contains('is-open'))) complete('click');
      }, 60);
    }
    down = null;
  });
  canvas.addEventListener('wheel', () => complete('zoom'), { passive: true });

  hint.querySelector('.ctrl-close').addEventListener('click', () => {
    hint.classList.remove('is-visible');
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    setTimeout(() => hint.remove(), 450);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => hint.classList.add('is-visible')));
})();
};
/* Load the seven dioramas, then build the page */
(function boot() {
  const loader = new THREE.GLTFLoader();
  if (window.MeshoptDecoder) loader.setMeshoptDecoder(MeshoptDecoder);
  const fail = () => { const l = document.getElementById("loading") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "loading" }));
    l.className = "scene-fail"; l.removeAttribute("style"); l.innerHTML = 'The 3D meadow couldn\'t start on this device. <a class="sign r" href="/list' + location.hash + '"><span>See the list view</span></a>'; };
  const done = () => { const l = document.getElementById("loading"); if (l) l.remove(); try { window.__main(); } catch (e) { console.error(e); fail(); } };
  window.GLB = {};
  // One .glb per project, fetched in parallel. Bump MODEL_VERSION when you replace a model.
  const MODEL_VERSION = "1";
  const ids = ["outlandish", "allora", "starling", "estimator", "stash", "nella", "annie"];
  const fetchBuf = id => fetch(`/models/${id}.glb?v=${MODEL_VERSION}`).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); });
  const ready = window.MeshoptDecoder ? MeshoptDecoder.ready : Promise.resolve();
  Promise.all(ids.map(id => Promise.all([fetchBuf(id), ready]).then(([buf]) =>
    new Promise(res => { try { loader.parse(buf, "", g => { GLB[id] = g.scene; res(); }, () => res()); } catch (e) { res(); } })
  ).catch(() => {}))).then(done, done);
})();

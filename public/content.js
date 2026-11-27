/* Site content shared by the 3D meadow (scene.js) and the list view (list.js).
   Plain strings and DOM only: no three.js here, so the list view loads without the 3D scene.
   Case-study copy comes from app/case-studies.json via window.__CASE_STUDIES (set by the loaders). */
window.SITE = (function () {
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const PROJECTS = [
  { id: "outlandish", name: "Outlandish", mesh: "Jeep", color: "#5B6B2E",
    q: "What if a map could take you somewhere new without giving the place away?",
    blurb: "Off-road navigation for iPhone, built on an anti-geotagging philosophy. Trails work offline, and the data joins USGS, RIDB and SurveyLA.",
    status: "On the App Store", year: "2020", role: "Founder, designer, engineer", built: "Swift, SwiftUI, AWS" },
  { id: "allora", name: "Allora", mesh: "AlarmClock", color: "#D9A520",
    q: "What if setting an alarm took a tap instead of a spin?",
    blurb: "An alarm app where you tap the hour instead of scrolling a wheel, switch alarms on and off together, and get a screen calm enough for a dark bedroom.",
    status: "In development", year: "2025", role: "Designer and developer", built: "Swift, SwiftUI" },
  { id: "starling", name: "Starling", mesh: "Birdhouse", color: "#6E9BB8",
    q: "What if you woke up to a different sound every morning?",
    blurb: "An alarm app that wakes you with a different birdsong each day, with a hand-painted look throughout.",
    status: "In development", year: "2026", role: "Designer and developer", built: "Swift, SwiftUI" },
  { id: "estimator", name: "Project Estimator", mesh: "Calculator", color: "#000000",
    q: "What if a studio could scope a project before the kickoff call?",
    blurb: "An AI estimator that drafts a project's first scope from how the studio actually estimates. Built through Offleash and adopted across Five & Done.",
    status: "Adopted by the studio", year: "2025", role: "Co-founder of Offleash, builder", built: "Internal tool" },
  { id: "stash", name: "Stash", mesh: "StickyNotes", color: "#E06A4F",
    q: "What if a notes app had no folders at all?",
    blurb: "A notes app where you write first and organize later. One continuous stream replaces the file-and-folder model.",
    status: "On the App Store", year: "2025", role: "Sole designer and developer", built: "Swift, SwiftUI" },
  { id: "nella", name: "Nella", mesh: "OpenBook", color: "#233A66",
    q: "What if an AI that could only write text could still hold a five-year-old's attention at bedtime?",
    blurb: "AI bedtime stories for iPhone. I led design and creative direction at Five & Done, from positioning and naming through launch.",
    status: "On the App Store", year: "2024", role: "Design and creative direction", built: "Five & Done team" },
  { id: "annie", name: "Annie", mesh: "TreasureChest", color: "#1E7279",
    q: "What if checking your spending were as quick as checking the time?",
    blurb: "A daily finance tracker built around a data visualization I invented, so a daily check-in takes a second instead of a spreadsheet.",
    status: "In progress", year: "2026", role: "Designer and developer", built: "Swift, SwiftUI" }
];

/* ---------- Case studies (app/case-studies.json, handed over by app/scene-loader.tsx) ----------
   Matched to scene objects by id or name. Non-empty fields override the defaults above. */
const hex = v => { const h = clean(v).replace(/[^0-9a-f]/gi, ""); return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h) ? "#" + h.toUpperCase() : ""; };
const CASE_STUDIES = Array.isArray(window.__CASE_STUDIES) ? window.__CASE_STUDIES : [];
const clean = v => (typeof v === "string" ? v.trim() : "");
for (const p of PROJECTS) {
  const c = CASE_STUDIES.find(x => x.id === p.id || clean(x.name).toLowerCase() === p.name.toLowerCase());
  if (!c) continue;
  p.cs = {
    premise: clean(c.premise),
    animatic: clean(c.animatic),
    platform: clean(c.platform),
    beats: (c.beats || []).map(b => ({ h: clean(b && b.h), b: clean(b && b.b) })).filter(b => b.h || b.b),
    ask: (c.ask || []).map(clean).filter(Boolean),
    ready: !!c.ready
  };
  if (clean(c.hook)) p.q = clean(c.hook);
  if (clean(c.status)) p.status = clean(c.status);
  if (clean(c.role)) p.role = clean(c.role);
  if (clean(c.years)) p.year = clean(c.years);
  if (clean(c.stack)) p.built = clean(c.stack);
  // Brand colours: color = main accent, color2/color3 = supporting colours. Blank or invalid values keep the defaults.
  const c1 = hex(c.color), c2 = hex(c.color2), c3 = hex(c.color3);
  if (c1) p.color = c1;
  p.color2 = c2; p.color3 = c3;
}
const isShipped = status => /^(On the|Adopted|App Store|Live)/i.test(status || "");

const DETAILS = {
  outlandish: {
    answer: "an off-road navigation app for iPhone built on an anti-geotagging philosophy.",
    signal: "Every good spot I found online was already crowded by the time I got there. A geotagged photo can turn a quiet trail into a parking problem in a single weekend, and I wanted to keep exploring without adding to it.",
    build: "I designed and wrote the app myself in Swift and SwiftUI starting in 2020, years before an AI could pair-program with me. Trails are built a new way that works offline, because the best places tend to have no signal. The data layer joins USGS, RIDB and SurveyLA into one model of public land, on an AWS backend.",
    design: "Navigation apps assume more sharing is better; Outlandish assumes the opposite. It gets you to a place without turning that place into a pin anyone can copy. It's built for casual explorers like me, and the newest version makes the map the root of the app, with the list tucked into a tab on the right edge.",
    taught: "Product quality is rarely the limiting factor; distribution is. A discovery app has a cold-start problem, because the content that attracts people only exists after people arrive. I now plan distribution before I plan features.",
    links: [["getoutlandish.com", "https://getoutlandish.com"]]
  },
  allora: {
    answer: "an alarm app for iPhone that rethinks waking up, starting from the input.",
    signal: "Late at night, half asleep, I'd flick a scroll wheel to land on 6:45 and overshoot it. The stock alarm is a precision time picker, used at the moment you have the least precision to give.",
    build: "Designed and built in Swift and SwiftUI. Most people wake at a handful of familiar times, so the core interaction is a grid of hours you tap directly, and alarms switch on or off as a set.",
    design: "No scroll wheel. Hours are big targets you can hit without your glasses, alarms toggle together, and the palette stays dim enough for a dark bedroom. Try the sketch below.",
    taught: "With the scroll wheel gone, much of the old screen turned out to exist only to support it. Change the input and the rest of the interface rearranges itself around the person.",
    links: []
  },
  starling: {
    answer: "an alarm app for iPhone that wakes you with a different birdsong each day.",
    signal: "Hear the same alarm every morning and it stops being a sound. It becomes something you brace for.",
    build: "Designed and built in Swift and SwiftUI. Each morning picks a different birdsong, so the alarm never settles into a sound you dread.",
    design: "The whole app has a hand-painted look, so it feels like something a person made, warm enough for the first thing you see each day.",
    taught: "Still in development. This is where the lesson will go.",
    links: [], pending: true
  },
  estimator: {
    answer: "an AI estimator for Five & Done, built through Offleash, the studio's innovation arm.",
    signal: "Scoping work at an agency pulls senior people into hours of estimating before anyone knows whether the client will sign.",
    build: "I co-founded Offleash to give ideas like this somewhere to go. The estimator captures how the studio actually estimates and lets an AI draft the first pass. It was built as an internal tool, then adopted across the studio.",
    design: "The AI's estimate is a first draft for people to refine, not a final number, so the interface is built around reviewing and adjusting.",
    taught: "An internal tool is speculative design with a built-in test audience. Colleagues tell you right away whether the future you imagined actually works.",
    links: [["projects.offleash.xyz", "https://projects.offleash.xyz"]], pending: true
  },
  stash: {
    answer: "a notes app for iPhone where you write first and organize later.",
    signal: "Every notes app asks where a thought belongs before you've finished having it. By the time I'd picked a folder, the idea was half gone.",
    build: "I was the sole designer and developer, in Swift and SwiftUI. Everything you save lives on one never-ending surface instead of in a tree of folders.",
    design: "Throw out the file-and-folder model and replace it with one continuous stream. Capturing a note should cost nothing; finding it later is the app's job.",
    taught: "Folders are a desktop metaphor that phones inherited without anyone asking. Removing a structure people assume is essential is the quickest way to learn whether they needed it.",
    links: [["stashtosave.com", "https://stashtosave.com"]]
  },
  nella: {
    answer: "an AI bedtime story app for iPhone, designed at Five & Done.",
    signal: "The model could only output text. Kids at bedtime want pictures, voices and someone to turn the page.",
    build: "I defined the target customer, the problem hypothesis and the positioning, named the product and set its creative direction. Then I took it through rapid prototyping, interaction design and user testing.",
    design: "Design the interface around the text so a story feels alive without generated images.",
    taught: "A model's limits make a good design brief. The constraint shaped the most distinctive parts of the product. I drove the launch across the app, the marketing site, social and lifecycle email.",
    links: [["nellastories.com", "https://nellastories.com"]]
  },
  annie: {
    answer: "a daily finance tracker built around a data visualization I invented.",
    signal: "Finance apps hand you ledgers and pie charts. That's a lot of reading for a question you ask every day: how am I doing?",
    build: "Designed and built in Swift and SwiftUI. The visualization is drawn in code, designed to be read every day instead of audited once a month.",
    design: "Replace the charts and tables with one visual form you can read in a second, so a daily check-in becomes a habit instead of a chore.",
    taught: "Still being built. Ask me how it's going.",
    links: [], pending: true
  }
};

// Drop real files in here as they're ready: icon (app icon, square, shown at 64×64), hero (16:9 image), screens (up to 4 phone screenshots: a path, or { src, alt }), animatic (MP4).
const shots = (id, alts) => alts.map((alt, i) => ({ src: `/screens/${id}-${i + 1}.webp`, alt }));
const ASSETS = {
  outlandish: { hero: null, animatic: null, screens: shots("outlandish", ["Trail details for 4S10 East Indian Creek, with clearance and surface at a glance", "Marking trail conditions: rocky, narrow, mud, steep and more", "A 19.6-mile route highlighted across the San Bernardino National Forest"]) },
  allora:     { hero: null, animatic: null, screens: shots("allora", ["The 24-hour dial, showing alarms at 6:20 and 6:30 AM and the time until wake-up", "Alarm Schedules: Call, Work and Weekend, each switched on or off as a set", "The red-shifted minute grid for picking an alarm time in the dark"]) },
  starling:   { hero: null, animatic: null, screens: shots("starling", ["A hand-painted Grey-headed Canary-flycatcher, today's bird", "Jump to Day: a calendar with a different bird for each day", "The hand-drawn keypad for adding alarms to a schedule"]) },
  estimator:  { hero: null, screens: [], animatic: null },
  stash:      { hero: null, animatic: null, screens: shots("stash", ["The keyboard opens with the app, ready to capture a thought", "Double-tap a note to highlight it", "Photos stacked in the stream, and a note crossed out with a swipe"]) },
  nella:      { hero: null, animatic: null, screens: shots("nella", ["Choosing a character: Astro the Gentle Fox", "Building a new character, Mad Libs style: Scout the Mischievous Koala", "The story read aloud word by word, with the character and setting above"]) },
  annie:      { hero: null, animatic: null, screens: shots("annie", ["October's spending as a spoke diagram, one spoke per day", "Logging a $61.72 purchase by hand", "The year at a glance, one spoke per month"]) }
};

function alloraSketch() {
  const hours = ["5", "6", "7", "8", "9", "10", "11", "12", "1"], on = new Set(["6", "7"]);
  return `
    <div class="mini" role="group" aria-label="Allora sketch">
      <div class="ph-row"><span>Morning</span><button class="toggle" id="allora-toggle" type="button" aria-pressed="true">All on</button></div>
      <div class="hours" id="allora-hours">${hours.map(h => `<button type="button" aria-pressed="${on.has(h)}" aria-label="${h} o'clock">${h}</button>`).join("")}</div>
      <p class="note" id="allora-note" aria-live="polite">2 alarms set</p>
    </div>
    <p class="flag" style="border-color:var(--active)">A working sketch of the idea, not the shipped interface. Tap an hour, then switch the set off at once.</p>`;
}
function wireAlloraSketch() {
  const grid = document.getElementById("allora-hours"), toggle = document.getElementById("allora-toggle"), note = document.getElementById("allora-note");
  const update = () => { const n = grid.querySelectorAll('[aria-pressed="true"]').length, s = n === 1 ? "" : "s"; note.textContent = grid.classList.contains("off") ? `${n} alarm${s} paused` : `${n} alarm${s} set`; };
  grid.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); update(); });
  toggle.addEventListener("click", () => { const off = grid.classList.toggle("off"); toggle.textContent = off ? "All off" : "All on"; toggle.setAttribute("aria-pressed", String(!off)); update(); });
}

function media(src, kind, label, spec) {
  if (src && kind === "img" && typeof src === "object") { label = src.alt || label; src = src.src; }
  if (src && kind === "video") return `<video src="${src}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video>`;
  if (src) return `<img src="${src}" alt="${esc(label)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block">`;
  return `<div class="ph-frame" style="width:100%;height:100%"><b>${label}</b><span>${spec}</span></div>`;
}

function wireDots() {
  const row = document.getElementById("pd-screens"), dots = document.getElementById("pd-dots");
  if (!row || !dots) return;
  const btns = [...dots.children], items = [...row.children];
  const sync = () => { const x = row.scrollLeft, step = items[1] ? items[1].offsetLeft - items[0].offsetLeft : 1;
    const k = Math.max(0, Math.min(items.length - 1, Math.round(x / step)));
    btns.forEach((b, i) => b.toggleAttribute("aria-current", i === k)); };
  row.addEventListener("scroll", sync, { passive: true });
  btns.forEach((b, i) => (b.onclick = () => row.scrollTo({ left: items[i].offsetLeft - items[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" })));
}
const esc = t => String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function whatIf(q) { return esc(q).replace(/^What if/, '<span class="wi">What if</span>'); }
// The case study for a project: from case-studies.json when there is one, otherwise built from the older DETAILS copy.
function caseFor(p) {
  if (p.cs) return { ...p.cs, premise: p.cs.premise || p.blurb };
  const d = DETAILS[p.id] || {};
  return {
    premise: p.blurb, animatic: "", platform: "", ready: false, ask: [],
    beats: [["The signal", d.signal], ["How it's built", d.build], ["Design decisions", d.design]].filter(([, b]) => b).map(([h, b]) => ({ h, b }))
  };
}
/* ---------- Project pages: a bento grid, composed differently for each project ----------
   A layout is a list of [tile, columns, rows, tone] on a 12-column grid (rows are 88px and grow to fit text).
   Tiles with nothing to show are skipped and the grid packs densely, so a layout survives an empty beat or a missing link.
   Tiles: hook, premise, facts, hero, b1–b3 (beats), s1–s4 (screens), anim, ask, link, sketch (Allora only).
   Tones: card (default), acc (project colour), ink (dark), tint (pale project colour), line (no fill). */
const LAYOUTS = {
  outlandish: [
    ["hook", 8, 4], ["facts", 4, 4, "acc"],
    ["hero", 12, 6],
    ["premise", 5, 3], ["s1", 3, 6, "tint"], ["b1", 4, 3, "ink"],
    ["b2", 5, 3, "acc"], ["b3", 4, 3, "line"],
    ["s2", 3, 6, "tint"], ["anim", 6, 6, "ink"], ["s3", 3, 6, "tint"],
    ["ask", 8, 2], ["link", 4, 2, "acc"]
  ],
  annie: [
    ["hook", 7, 4, "acc"], ["premise", 5, 4],
    ["s1", 3, 6, "tint"], ["b1", 6, 3], ["s2", 3, 6, "tint"],
    ["b2", 6, 3, "line"],
    ["anim", 9, 6, "ink"], ["s3", 3, 6, "tint"],
    ["b3", 6, 3, "acc"], ["facts", 6, 3],
    ["ask", 12, 2], ["link", 12, 2]
  ],
  stash: [
    ["hook", 12, 3, "line"],
    ["premise", 6, 6, "acc"], ["s1", 3, 6, "tint"], ["s2", 3, 6, "tint"],
    ["b1", 4, 3], ["b2", 4, 3, "ink"], ["b3", 4, 3],
    ["s3", 3, 6, "tint"], ["hero", 9, 6],
    ["facts", 4, 3], ["link", 4, 3, "acc"], ["ask", 4, 3]
  ],
  allora: [
    ["sketch", 4, 7, "ink"], ["hook", 8, 4], ["premise", 8, 3, "line"],
    ["b1", 6, 3], ["b2", 6, 3, "acc"],
    ["s1", 3, 6, "tint"], ["b3", 6, 6, "ink"], ["s2", 3, 6, "tint"],
    ["s3", 3, 6, "tint"], ["anim", 9, 6],
    ["facts", 4, 3], ["ask", 8, 3, "acc"],
    ["link", 12, 2]
  ],
  nella: [
    ["hook", 8, 4, "acc"], ["premise", 4, 4, "line"],
    ["s1", 3, 6, "tint"], ["b1", 6, 3], ["s2", 3, 6, "tint"],
    ["b2", 6, 3, "ink"],
    ["s3", 3, 6, "tint"], ["anim", 9, 6, "ink"],
    ["hero", 8, 5], ["facts", 4, 3], ["link", 4, 2, "acc"],
    ["ask", 12, 2], ["b3", 12, 2]
  ],
  estimator: [
    ["hook", 7, 4], ["premise", 5, 4, "acc"],
    ["hero", 12, 6],
    ["b1", 4, 3, "ink"], ["b2", 4, 3], ["b3", 4, 3, "acc"],
    ["s1", 8, 5, "tint"], ["facts", 4, 3], ["link", 4, 2, "line"],
    ["anim", 12, 5, "ink"], ["ask", 12, 2]
  ],
  starling: [
    ["hook", 8, 4, "acc"], ["s1", 4, 7, "tint"],
    ["premise", 8, 3, "line"],
    ["b1", 6, 4], ["b2", 6, 4, "ink"],
    ["s2", 4, 6, "tint"], ["s3", 4, 6, "tint"], ["b3", 4, 3], ["facts", 4, 3],
    ["anim", 12, 5], ["ask", 12, 2], ["link", 12, 2]
  ]
};
const DEFAULT_LAYOUT = [
  ["hook", 8, 4], ["facts", 4, 4, "acc"], ["hero", 12, 6], ["premise", 6, 3], ["b1", 6, 3, "ink"],
  ["s1", 3, 6, "tint"], ["b2", 6, 3], ["s2", 3, 6, "tint"], ["b3", 6, 3, "acc"], ["anim", 8, 5, "ink"], ["link", 4, 2], ["ask", 4, 3]
];
// Text colour on the project colour: the project's own supporting colour when it reads well, otherwise cream or dark ink.
const lum = h => { const n = h.length === 4 ? h.slice(1).split("").map(x => x + x).join("") : h.slice(1); return [0, 2, 4].map(i => { const v = parseInt(n.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0); };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
// "What if" lettering: always the project's colour, nudged lighter or darker only as far as it needs to read on the tile behind it.
const toHex = rgb => "#" + rgb.map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const rgbOf = h => { const n = h.length === 4 ? h.slice(1).split("").map(x => x + x).join("") : h.slice(1); return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16)); };
const readable = (col, bg, min = 3) => {
  if (contrast(col, bg) >= min) return col;
  const toward = lum(bg) > 0.4 ? [0, 0, 0] : [255, 255, 255], c = rgbOf(col);
  for (let k = 0.05; k <= 1; k += 0.05) { const m = toHex(c.map((v, i) => v + (toward[i] - v) * k)); if (contrast(m, bg) >= min) return m; }
  return toHex(toward);
};
const wiOnAcc = p => {
  const own = [p.color2, p.color3].filter(Boolean).sort((a, b) => contrast(p.color, b) - contrast(p.color, a))[0];
  return own && contrast(p.color, own) >= 3 ? own : readable(p.color, p.color, 3);
};
const wiVars = p => `--wi:${readable(p.color, "#EEE7DB")};--wi-line:${readable(p.color, "#F7F2EA")};--wi-ink:${readable(p.color, "#221C16")};--wi-acc:${wiOnAcc(p)}`;
const onAcc = p => {
  const own = [p.color2, p.color3].filter(Boolean).sort((a, b) => contrast(p.color, b) - contrast(p.color, a))[0];
  if (own && contrast(p.color, own) >= 4.5) return own;
  return contrast(p.color, "#FFF8EE") >= contrast(p.color, "#221C16") ? "#FFF8EE" : "#221C16";
};

function sheetHTML(p) {
  const c = caseFor(p), d = DETAILS[p.id] || { links: [] }, a = ASSETS[p.id] || {}, i = PROJECTS.indexOf(p);
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const paras = (c.premise || "").split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
  const facts = [["Status", p.status], ["Platform", c.platform], ["Built with", p.built]].filter(([, v]) => v && String(v).trim());
  const web = /web/i.test(c.platform || "");
  const mail = t => `mailto:shreyas.parat@gmail.com?subject=${encodeURIComponent(`${p.name}: ${t}`)}`;
  const label = () => ""; // tile eyebrows removed

  const screen = k => {
    if (!web) return `<div class="bt-phone">${media(a.screens && a.screens[k], "img", `Screen ${k + 1}`, "1179 × 2556")}</div>`;
    return `<div class="bt-browser"><i aria-hidden="true"></i><div>${media(a.screens && a.screens[k], "img", `Screen ${k + 1}`, "2400 × 1500")}</div></div>`;
  };
  const beat = k => {
    const b = c.beats[k];
    if (!b) return null;
    const n = String(k + 1).padStart(2, "0");
    return { cls: b.b ? "t-beat" : "t-beat t-statement",
      html: `${label(n)}${b.h ? `<h3>${esc(b.h)}</h3>` : ""}${b.b ? `<p>${esc(b.b)}</p>` : ""}` };
  };
  const tiles = {
    hook: () => ({ cls: "t-hook", html: `${a.icon ? `<img class="bt-icon" src="${a.icon}" alt="${esc(p.name)} app icon" width="56" height="56">` : ""}${label(esc(p.name))}<h1 class="pd-q">${whatIf(p.q)}</h1>` }),
    premise: () => paras.length ? { cls: "t-premise", html: paras.map(t => `<p>${esc(t)}</p>`).join("") } : null,
    facts: () => facts.length ? { cls: "t-facts", html: `<dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` } : null,
    hero: () => ({ cls: "t-media", html: media(a.hero, "img", "Hero image", "Landscape, 2400 × 1350") }),
    b1: () => beat(0), b2: () => beat(1), b3: () => beat(2),
    s1: () => ({ cls: web ? "t-screen t-web" : "t-screen", html: screen(0) }),
    s2: () => ({ cls: web ? "t-screen t-web" : "t-screen", html: screen(1) }),
    s3: () => ({ cls: web ? "t-screen t-web t-s3" : "t-screen t-s3", html: screen(2) }),
    s4: () => ({ cls: web ? "t-screen t-web" : "t-screen", html: screen(3) }),
    anim: () => ({ cls: "t-anim", html: a.animatic ? media(a.animatic, "video", "Animatic")
      : `${label("Animatic")}<span class="play" aria-hidden="true"></span><span class="bt-cap">${c.animatic ? esc(c.animatic) : `The ${esc(p.name)} animatic will play here`}</span>` }),
    ask: () => c.ask.length ? { cls: "t-ask", html: `<span class="bt-label">Ask me more about</span><ul>${c.ask.map(t => `<li><a href="${mail(t)}">${esc(t.charAt(0).toUpperCase() + t.slice(1))}<span aria-hidden="true">→</span></a></li>`).join("")}</ul>` } : null,
    link: () => d.links && d.links.length ? { cls: "t-link", html: d.links.map(([t, u]) => `<a href="${u}">${label("Visit")}<b>${esc(t)}</b><span aria-hidden="true">↗</span></a>`).join("") } : null,
    sketch: () => p.id === "allora" ? { cls: "t-sketch", html: `${label("Try it")}${alloraSketch()}` } : null
  };

  const cells = (LAYOUTS[p.id] || DEFAULT_LAYOUT).map(([key, cols, rows, tone]) => {
    const t = tiles[key] && tiles[key]();
    if (!t) return "";
    return `<div class="bt ${t.cls} tone-${tone || "card"}" style="--c:${cols};--r:${rows}">${t.html}</div>`;
  }).join("");

  return `
    <div class="bento" data-screens="${(LAYOUTS[p.id] || DEFAULT_LAYOUT).filter(([k]) => /^s\d$/.test(k)).length}" style="--acc:${p.color};--on-acc:${onAcc(p)};--acc-2:${p.color2 || p.color};--acc-3:${p.color3 || p.color};${wiVars(p)}">${cells}</div>
    <nav class="sh-nav" aria-label="More projects">
      <a href="#" aria-label="Back to all projects"><span class="sign l"><span>Back</span></span></a>
      <a href="#${next.id}" aria-label="Next project: ${esc(next.name)}"><span class="sign r"><span>${esc(next.name)}</span></span></a>
    </nav>
    ${footerHTML(p.id)}`;
}
/* ---------- Footer: closes every page in the sheet (about + project pages), in the list view and the 3D meadow ---------- */
const LIVE = [["getoutlandish.com", "https://getoutlandish.com"], ["stashtosave.com", "https://stashtosave.com"], ["nellastories.com", "https://nellastories.com"], ["projects.offleash.xyz", "https://projects.offleash.xyz"]];
function footerHTML(currentId) {
  const inList = !!document.querySelector(".sheet.lv");
  const hash = currentId ? "#" + currentId : "";
  const ext = (t, u) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)}<span aria-hidden="true">↗</span></a>`;
  return `
    <footer class="sh-foot" aria-label="Site footer">
      <div class="ft-in">
        <div class="ft-top">
          <div class="ft-cta">
            <h2 class="ft-h">Got a <span class="wi">what if</span> of your own?</h2>
            <p class="ft-sub">Tell me what you're building. Email is the quickest way to reach me.</p>
            <div class="ft-actions">
              <a class="sign r gold" href="mailto:shreyas.parat@gmail.com"><span>Email me</span></a>
            </div>
          </div>
          <nav class="ft-cols" aria-label="Footer">
            <div>
              <h3>Projects</h3>
              <ul>${PROJECTS.map(p => `<li><a href="#${p.id}"${p.id === currentId ? ' aria-current="page"' : ""}>${esc(p.name)}</a></li>`).join("")}</ul>
            </div>
            <div>
              <h3>Live</h3>
              <ul>${LIVE.map(([t, u]) => `<li>${ext(t, u)}</li>`).join("")}</ul>
            </div>
            <div>
              <h3>Site</h3>
              <ul>
                <li><a href="${inList ? "/list" : "/#about"}">About</a></li>
                <li>${inList ? `<a href="/${hash}">Explore in 3D</a>` : `<a href="/list${hash}">List view</a>`}</li>
              </ul>
            </div>
          </nav>
        </div>
        <div class="ft-base">
          <span>© ${new Date().getFullYear()} Shreyas Parat</span>
          <span class="ft-made">Made in Los Angeles, CA</span>
          <button class="ft-top-btn" type="button" data-to-top>Back to top <span aria-hidden="true">↑</span></button>
        </div>
      </div>
    </footer>`;
}
// One listener for every footer: "Back to top" scrolls the sheet (the page scrolls inside it, not the window).
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-to-top]");
  if (!b) return;
  const sc = b.closest(".sheet") || document.scrollingElement;
  sc.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});
/* ---------- About page: shared by the 3D sheet and the list view (which adds the signpost) ----------
   Same 12-column bento grid as the project pages; tile = [key, columns, rows, tone]. */
const ABOUT_LAYOUT = [["intro", 8, 4], ["photo", 4, 7], ["bg", 8, 3, "line"]];
const ABOUT_LAYOUT_POST = [["intro", 8, 4], ["post", 4, 7, "tint"], ["photo", 4, 3], ["bg", 4, 3, "line"]];
function signpostHTML() {
  return `
    <nav class="lv-post" aria-label="Projects">
      <ol class="mc-list">
        ${PROJECTS.map(p => `<li><a href="#${p.id}"><span class="sign r"><span>${esc(p.name)}</span></span><span class="qq">${esc(p.q)}</span></a></li>`).join("")}
      </ol>
    </nav>`;
}
function aboutHTML(opts = {}) {
  const tiles = {
    intro: () => ({ cls: "t-about", html: `
          <header>
            <h1 class="pd-name">Shreyas Parat</h1>
            <p class="pd-role">Design &amp; Build</p>
          </header>
          <div>
            <p class="ab-lede">I'm a design engineer who builds the answers to <i>what if</i>. I trained as a mechanical engineer, ran thermal simulations at General Motors, and have written my own iOS apps in Swift since 2020. Today I'm Product Lead at Five &amp; Done, where I co-founded Offleash, the studio's innovation arm.</p>
            <div class="ab-ctas">
              <a class="sign r gold" href="mailto:shreyas.parat@gmail.com"><span>Email me</span></a>
            </div>
          </div>` }),
    photo: () => ({ cls: "t-media t-photo", html: `<img src="/about/shreyas-trail-full.jpg" alt="Shreyas crouching on a mountain trail with his dog, pine forest and ridgelines behind them" width="1818" height="1228" loading="lazy" decoding="async">` }),
    post: () => opts.signpost ? { cls: "t-post", html: signpostHTML() } : null,
    bg: () => ({ cls: "t-bg", html: `
          <h2 class="vh">Background</h2>
          <ul class="ab-list">
            <li><b>2022</b><span>Joined Five &amp; Done; now Product Lead</span></li>
            <li><b>2021</b><span>First designer at AllTakes</span></li>
            <li><b>2020</b><span>Shipped Outlandish, my first independent iOS app</span></li>
            <li><b>2017</b><span>Co-founded GM's internal design studio</span></li>
            <li><b>2015</b><span>B.S. Mechanical Engineering, University of Michigan</span></li>
          </ul>` })
  };
  const cells = (opts.signpost ? ABOUT_LAYOUT_POST : ABOUT_LAYOUT).map(([key, cols, rows, tone]) => {
    const t = tiles[key] && tiles[key]();
    if (!t) return "";
    return `<div class="bt ${t.cls} tone-${tone || "card"}" style="--c:${cols};--r:${rows}">${t.html}</div>`;
  }).join("");
  return `
    <div class="bento bento-about${opts.signpost ? " has-post" : ""}" style="--acc:var(--plank-gold);--on-acc:#221C16">${cells}</div>
    ${footerHTML()}`;
}
function wireAbout() {}

/* ---------- Cascade in: project-page tiles settle in as a soft diagonal wave from the top-left, all on open; nothing
   waits for scroll. Delay follows each tile's position (not its index), so the wave reads as one continuous motion.
   Opacity leads, while the lift, scale and blur ease out longer on an expo curve. ---------- */
function unfoldBento(root) {
  const grid = (root || document).querySelector(".bento:not(.bento-about)");
  if (!grid || reduceMotion || !grid.animate) return;
  const g = grid.getBoundingClientRect();
  const BASE = 180, PER_Y = 0.32, PER_X = 0.14, MAX = 900; // ms of delay per px down / across, capped so long pages don't drag
  const EASE = "cubic-bezier(.16, 1, .3, 1)";
  grid.querySelectorAll(":scope > .bt").forEach(el => {
    const r = el.getBoundingClientRect();
    const delay = BASE + Math.min(MAX, (r.top - g.top) * PER_Y + (r.left - g.left) * PER_X);
    el.animate([
      { opacity: 0, transform: "translateY(10px) scale(.985)", filter: "blur(6px)" },
      { opacity: 1, offset: 0.55 },
      { opacity: 1, transform: "none", filter: "blur(0)" }
    ], { duration: 1100, delay, easing: EASE, fill: "backwards" });
  });
}

return { PROJECTS, DETAILS, ASSETS, isShipped, alloraSketch, wireAlloraSketch, media, wireDots, esc, whatIf, caseFor, sheetHTML, aboutHTML, footerHTML, wireAbout, unfoldBento };
})();

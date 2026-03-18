import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "demo-assets");

const scenes = [
  {
    id: "01",
    stage: "Scene 1",
    title: "Customer signs up and chooses a guided onboarding path",
    subtitle:
      "Loop starts by asking what the customer is launching, who it is for, and whether they want to build from scratch or import existing materials.",
    status: "Onboarding",
    accent: "#6157e7",
    cards: [
      { title: "Choose workflow", body: "Pick product launch, messaging refresh, or repositioning." },
      { title: "Import or start fresh", body: "Bring in docs, decks, or existing website copy." },
      { title: "Set team context", body: "Capture owner, launch date, product version, and approval path." },
    ],
    note: "Loop reduces blank-page anxiety with a guided setup instead of dropping the user into a giant strategy canvas.",
  },
  {
    id: "02",
    stage: "Scene 2",
    title: "They build Product Truth one section at a time",
    subtitle:
      "The customer fills out problem, solution, audience, capabilities, competitors, and differentiation using guided prompts and smaller canvases.",
    status: "Product Truth",
    accent: "#6f63f6",
    cards: [
      { title: "Problem Statement", body: "Core problem, stakes, and why current alternatives fall short." },
      { title: "Solution", body: "What the product does, how it solves the problem, and why now." },
      { title: "Audience", body: "Primary buyer, influencer, pain points, goals, and buying triggers." },
      { title: "Capabilities", body: "Feature-to-benefit mapping translates product details into customer value." },
      { title: "Competitors", body: "Capture alternatives, win/loss context, and differentiators." },
    ],
    note: "Product Truth gives every AI suggestion, narrative draft, and launch asset a stronger factual base.",
  },
  {
    id: "03",
    stage: "Scene 3",
    title: "Loop turns raw Product Truth into an approved narrative",
    subtitle:
      "Once the product inputs are clear, the customer moves into Core Narrative to define positioning, value proposition, messaging pillars, headline, and pitch.",
    status: "Core Narrative",
    accent: "#7b5cf0",
    cards: [
      { title: "Positioning", body: "Refine the market-facing statement instead of repeating a feature list." },
      { title: "Value Proposition", body: "Distill the core promise into business value and customer outcomes." },
      { title: "Messaging Pillars", body: "Three to four repeatable messages become the narrative spine." },
      { title: "AI Suggestions", body: "Loop suggests stronger phrasing and section-aware improvements." },
    ],
    note: "AI works best here as a section-aware narrative assistant, not a generic chatbot.",
  },
  {
    id: "04",
    stage: "Scene 4",
    title: "They move into GTM and create launch-ready assets",
    subtitle:
      "With the narrative approved, Loop helps the team operationalize it across channels, launch plans, and asset generation.",
    status: "GTM + Assets",
    accent: "#5d7bf2",
    cards: [
      { title: "GTM Plan", body: "Define launch goal, segment focus, channels, and milestones." },
      { title: "Asset Suggestions", body: "Website hero, launch email, sales brief, and enablement snippets." },
      { title: "Alignment", body: "Keep generated assets tied to the approved narrative." },
    ],
    note: "This is where Loop starts feeling sellable: one approved story turns into real launch outputs faster.",
  },
  {
    id: "05",
    stage: "Scene 5",
    title: "Loop gives review feedback before launch goes live",
    subtitle:
      "The assistant flags gaps in proof, weak differentiation, and inconsistent claims. Teams review and resolve these before publishing.",
    status: "Review Cycle",
    accent: "#e89a2d",
    cards: [
      { title: "Flag", body: "Positioning is too generic for the category." },
      { title: "Flag", body: "Messaging claims lack proof points or metrics." },
      { title: "Flag", body: "Sales and website copy drift from the approved narrative." },
      { title: "Review Workflow", body: "Owners resolve items, approvers sign off, and Loop stores what changed." },
    ],
    note: "This is the retention hook: Loop catches narrative drift and launch risk before assets go live, not after.",
  },
  {
    id: "06",
    stage: "Scene 6",
    title: "The team launches with one aligned story",
    subtitle:
      "Once the review items are closed and the narrative is approved, the launch goes live with assets, sales messaging, and positioning aligned.",
    status: "Launch Live",
    accent: "#18a36b",
    cards: [
      { title: "Published Outputs", body: "Approved narrative, live website copy, GTM brief, and outbound messaging." },
      { title: "Team Outcome", body: "Founders, PMM, marketing, and sales work from the same source of truth." },
      { title: "Loop's Role", body: "A narrative operating system from input through execution." },
    ],
    note: "Customers feel the value in fewer review loops, faster launch readiness, and stronger cross-functional alignment.",
  },
  {
    id: "07",
    stage: "Scene 7",
    title: "Loop tracks feedback, analytics, and narrative health after launch",
    subtitle:
      "The customer sees how the message is landing and where the story may need refinement for the next iteration.",
    status: "Feedback + Analytics",
    accent: "#3a9b94",
    cards: [
      { title: "Signals", body: "Website engagement, win/loss notes, sales objections, and customer feedback." },
      { title: "Narrative Health", body: "Scores for clarity, consistency, proof, and launch readiness." },
      { title: "Recommendations", body: "Tighten pillar two, improve proof, and refine competitive claims." },
      { title: "Feedback Loop", body: "Feed real-world learning back into Product Truth and Narrative." },
    ],
    note: "Analytics and feedback are what keep Loop useful after the initial launch project is over.",
  },
  {
    id: "08",
    stage: "Scene 8",
    title: "From signup to live launch, Loop becomes the system of record for product narrative",
    subtitle:
      "This is the end-state workflow for the MVP: onboarding, product truth, narrative creation, GTM execution, review, launch, and feedback.",
    status: "End-to-End Loop",
    accent: "#6157e7",
    cards: [
      { title: "1. Sign up", body: "Choose the guided launch workflow." },
      { title: "2. Build Product Truth", body: "Capture product, audience, capabilities, and competition." },
      { title: "3. Create Narrative", body: "Use AI-assisted refinement to approve one clear story." },
      { title: "4. Plan GTM", body: "Generate launch-ready assets and channel messaging." },
      { title: "5. Learn and iterate", body: "Use feedback and analytics to improve the next version." },
    ],
    note: "This is the investor and customer story: Loop connects strategy, execution, and learning in one product.",
  },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(lines, x, y, lineHeight, className) {
  const tspans = lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`)
    .join("");
  return `<text x="${x}" y="${y}" class="${className}">${tspans}</text>`;
}

function sceneSvg(scene, index) {
  const cardWidth = 372;
  const cardHeight = 148;
  const positions = [
    [72, 320],
    [468, 320],
    [864, 320],
    [72, 492],
    [468, 492],
  ];

  const cards = scene.cards
    .map((card, cardIndex) => {
      const [x, y] = positions[cardIndex] || [864, 492];
      const titleLines = wrapText(card.title, 24);
      const bodyLines = wrapText(card.body, 40);
      return `
        <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="26" fill="#ffffff" stroke="#d8d0f9" />
        ${textBlock(titleLines, x + 26, y + 42, 20, "card-title")}
        ${textBlock(bodyLines, x + 26, y + 78, 18, "card-body")}
      `;
    })
    .join("");

  const titleLines = wrapText(scene.title, 52);
  const subtitleLines = wrapText(scene.subtitle, 86);
  const noteLines = wrapText(scene.note, 72);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">
  <defs>
    <linearGradient id="bg-${scene.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="48%" stop-color="#f6f2ff"/>
      <stop offset="100%" stop-color="#efeaff"/>
    </linearGradient>
    <linearGradient id="side-${scene.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f1edff"/>
      <stop offset="100%" stop-color="#faf9ff"/>
    </linearGradient>
  </defs>
  <style>
    .eyebrow { fill: ${scene.accent}; font: 700 18px Inter, Arial, sans-serif; letter-spacing: 0.14em; }
    .title { fill: #2f2a53; font: 800 40px Inter, Arial, sans-serif; }
    .subtitle { fill: #675f93; font: 500 20px Inter, Arial, sans-serif; }
    .card-title { fill: #2f2a53; font: 800 24px Inter, Arial, sans-serif; }
    .card-body { fill: #6d6697; font: 500 17px Inter, Arial, sans-serif; }
    .small-label { fill: #7a739f; font: 700 13px Inter, Arial, sans-serif; letter-spacing: 0.12em; }
    .note-title { fill: #6157e7; font: 800 18px Inter, Arial, sans-serif; }
    .note-copy { fill: #5f5887; font: 500 18px Inter, Arial, sans-serif; }
    .tab { fill: #726b9a; font: 700 14px Inter, Arial, sans-serif; }
    .tab-active { fill: #6157e7; font: 800 14px Inter, Arial, sans-serif; }
    .meta { fill: #7a739f; font: 600 12px Inter, Arial, sans-serif; }
  </style>

  <rect width="1440" height="900" fill="url(#bg-${scene.id})"/>
  <rect x="18" y="18" width="1404" height="864" rx="30" fill="#ffffff" opacity="0.72" stroke="#d8d0f9"/>

  <rect x="18" y="18" width="1404" height="34" rx="16" fill="#f7f3ff" opacity="0.96"/>
  <circle cx="48" cy="35" r="5" fill="#ddd3ff"/>
  <circle cx="66" cy="35" r="5" fill="#ddd3ff"/>
  <circle cx="84" cy="35" r="5" fill="#ddd3ff"/>

  <rect x="450" y="74" width="540" height="48" rx="18" fill="#ece7ff" stroke="#d8d0f9"/>
  <rect x="458" y="82" width="94" height="32" rx="12" fill="#ffffff"/>
  <text x="482" y="102" class="tab-active">Loop</text>
  <text x="580" y="102" class="tab">Narrative Intelligence</text>
  <text x="792" y="102" class="tab">Brand Guideline</text>
  <text x="962" y="102" class="tab">Community</text>

  <rect x="18" y="140" width="220" height="742" fill="url(#side-${scene.id})" stroke="#d8d0f9"/>
  <text x="46" y="190" class="title" style="font-size: 24px;">LOOP</text>
  <text x="46" y="248" class="small-label">WORKSPACE</text>
  <rect x="36" y="276" width="184" height="34" rx="12" fill="#e6e0ff"/>
  <text x="58" y="298" class="tab-active">Product Truth</text>
  <text x="58" y="336" class="meta">• Product Overview</text>
  <text x="58" y="364" class="meta">• Problem Statement</text>
  <text x="58" y="392" class="meta">• Solution</text>
  <text x="58" y="420" class="meta">• Audience</text>
  <text x="58" y="448" class="meta">• Differentiation</text>
  <text x="58" y="476" class="meta">• Capabilities</text>
  <text x="58" y="504" class="meta">• Competitors</text>

  <rect x="238" y="140" width="1184" height="118" fill="#ffffff" opacity="0.96" stroke="#d8d0f9"/>
  <circle cx="290" cy="188" r="18" fill="#ece8ff"/>
  <text x="282" y="195" class="tab-active">∞</text>
  <text x="322" y="194" class="card-title" style="font-size: 20px;">Product Name</text>
  <text x="322" y="228" class="meta">Owner: Mayank Trivedi   ·   Launch Date   ·   Version v1.0   ·   Status Planned</text>
  <text x="1180" y="194" class="tab">Add one-line description</text>

  <rect x="612" y="272" width="438" height="40" rx="16" fill="#ece7ff" stroke="#d8d0f9"/>
  <rect x="620" y="278" width="104" height="28" rx="10" fill="#ffffff"/>
  <text x="640" y="297" class="tab-active">Product Truth</text>
  <text x="748" y="297" class="tab">Core Narrative</text>
  <text x="870" y="297" class="tab">GTM</text>
  <text x="930" y="297" class="tab">Assets</text>
  <text x="998" y="297" class="tab">Feedback</text>

  <text x="300" y="348" class="eyebrow">${scene.stage.toUpperCase()}</text>
  ${textBlock(titleLines, 300, 390, 48, "title")}
  ${textBlock(subtitleLines, 300, 500, 28, "subtitle")}

  <rect x="1184" y="348" width="162" height="40" rx="20" fill="${scene.accent}" opacity="0.16"/>
  <text x="1212" y="374" class="eyebrow" style="letter-spacing: 0.04em;">${escapeHtml(scene.status.toUpperCase())}</text>

  ${cards}

  <rect x="1126" y="596" width="246" height="160" rx="26" fill="#ffffff" stroke="#d8d0f9"/>
  <text x="1152" y="632" class="note-title">Why this matters</text>
  ${textBlock(noteLines, 1152, 666, 24, "note-copy")}

  <rect x="1318" y="320" width="64" height="180" rx="22" fill="#ffffff" stroke="#7a65f2" stroke-width="2"/>
  <circle cx="1350" cy="354" r="19" fill="#f4f1ff" stroke="#d8d0f9"/>
  <text x="1343" y="360" class="tab-active">✦</text>
  <text x="1356" y="470" class="eyebrow" style="writing-mode: vertical-rl; glyph-orientation-vertical: 0; letter-spacing: 0.08em;">AI ASSISTANT</text>

  <rect x="1240" y="804" width="120" height="46" rx="18" fill="#6157e7"/>
  <text x="1270" y="833" style="fill:#ffffff;font:700 18px Inter, Arial, sans-serif;">Ask AI</text>

  <text x="72" y="844" class="meta">Loop MVP demo storyboard · frame ${index + 1} of ${scenes.length}</text>
</svg>`;
}

function storyboardHtml() {
  const cards = scenes
    .map(
      (scene, index) => `
        <article class="frame-card">
          <div class="frame-meta">
            <span>${scene.stage}</span>
            <strong>${index + 1}. ${scene.title}</strong>
          </div>
          <img src="./scene-${scene.id}.svg" alt="${escapeHtml(scene.title)}">
          <p>${escapeHtml(scene.note)}</p>
        </article>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Loop MVP Storyboard</title>
  <style>
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: linear-gradient(180deg, #faf8ff 0%, #f2eeff 100%); color: #2f2a53; }
    .wrap { max-width: 1320px; margin: 0 auto; padding: 32px 24px 64px; }
    h1 { margin: 0 0 10px; font-size: 38px; }
    p.lead { margin: 0 0 28px; color: #675f93; font-size: 18px; max-width: 880px; }
    .links { display: flex; gap: 14px; margin-bottom: 28px; flex-wrap: wrap; }
    .links a { text-decoration: none; color: #6157e7; background: #ece7ff; border: 1px solid #d8d0f9; padding: 10px 14px; border-radius: 999px; font-weight: 700; }
    .grid { display: grid; gap: 22px; }
    .frame-card { background: rgba(255,255,255,0.88); border: 1px solid #d8d0f9; border-radius: 24px; padding: 18px; box-shadow: 0 20px 40px rgba(93, 76, 180, 0.08); }
    .frame-meta { display: grid; gap: 4px; margin-bottom: 14px; }
    .frame-meta span { color: #6157e7; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
    .frame-meta strong { font-size: 22px; }
    .frame-card img { width: 100%; height: auto; border-radius: 18px; border: 1px solid #ddd5fb; background: #fff; }
    .frame-card p { margin: 14px 0 0; color: #5f5887; font-size: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Loop MVP Storyboard</h1>
    <p class="lead">A downloadable visual walkthrough from user signup to launch and feedback. Open the preview for autoplay, or review each frame below.</p>
    <div class="links">
      <a href="../loop-mvp-demo.html">Open original autoplay demo</a>
      <a href="./preview.html">Open storyboard preview</a>
    </div>
    <div class="grid">${cards}</div>
  </div>
</body>
</html>`;
}

function previewHtml() {
  const labels = scenes.map((scene) => scene.title);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Loop MVP Preview</title>
  <style>
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: radial-gradient(circle at top left, #ffffff 0, #f7f3ff 35%, #f1ecff 100%); color: #2f2a53; }
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .shell { width: min(1480px, 100%); background: rgba(255,255,255,0.66); border: 1px solid #d8d0f9; border-radius: 28px; box-shadow: 0 24px 60px rgba(79, 64, 170, 0.12); padding: 20px; }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
    h1 { margin: 0; font-size: 30px; }
    .caption { color: #675f93; font-size: 16px; }
    .viewer { background: #fff; border: 1px solid #ddd5fb; border-radius: 22px; overflow: hidden; }
    .viewer img { display: block; width: 100%; height: auto; }
    .controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 16px; }
    button { border: 1px solid #d8d0f9; background: #f5f1ff; color: #6157e7; border-radius: 999px; padding: 10px 16px; font: 700 14px Inter, Arial, sans-serif; cursor: pointer; }
    .label { color: #5f5887; font-size: 14px; }
    .progress { margin-top: 14px; height: 8px; background: #ece7ff; border-radius: 999px; overflow: hidden; }
    .fill { height: 100%; width: 12.5%; background: linear-gradient(90deg, #6157e7 0%, #8d7dff 100%); transition: width .25s ease; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="shell">
      <div class="top">
        <div>
          <h1>Loop MVP Preview</h1>
          <div class="caption">Autoplay storyboard preview you can open directly in the browser.</div>
        </div>
        <div class="label" id="sceneLabel"></div>
      </div>
      <div class="viewer">
        <img id="frame" src="./scene-01.svg" alt="Loop MVP scene">
      </div>
      <div class="controls">
        <button id="prevBtn">Prev</button>
        <button id="playBtn">Pause</button>
        <button id="nextBtn">Next</button>
      </div>
      <div class="progress"><div class="fill" id="fill"></div></div>
    </div>
  </div>
  <script>
    const frames = ${JSON.stringify(scenes.map((scene) => `./scene-${scene.id}.svg`))};
    const labels = ${JSON.stringify(labels)};
    const frame = document.getElementById("frame");
    const fill = document.getElementById("fill");
    const label = document.getElementById("sceneLabel");
    const playBtn = document.getElementById("playBtn");
    let index = 0;
    let playing = true;
    let timer = null;

    function render() {
      frame.src = frames[index];
      label.textContent = labels[index];
      fill.style.width = ((index + 1) / frames.length) * 100 + "%";
    }

    function next() {
      index = (index + 1) % frames.length;
      render();
    }

    function prev() {
      index = (index - 1 + frames.length) % frames.length;
      render();
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(next, 2600);
    }

    document.getElementById("nextBtn").addEventListener("click", () => { next(); if (playing) start(); });
    document.getElementById("prevBtn").addEventListener("click", () => { prev(); if (playing) start(); });
    playBtn.addEventListener("click", () => {
      playing = !playing;
      playBtn.textContent = playing ? "Pause" : "Play";
      if (playing) start();
      else clearInterval(timer);
    });

    render();
    start();
  </script>
</body>
</html>`;
}

fs.mkdirSync(outDir, { recursive: true });

scenes.forEach((scene, index) => {
  fs.writeFileSync(path.join(outDir, `scene-${scene.id}.svg`), sceneSvg(scene, index), "utf8");
});

fs.writeFileSync(path.join(outDir, "storyboard.html"), storyboardHtml(), "utf8");
fs.writeFileSync(path.join(outDir, "preview.html"), previewHtml(), "utf8");

console.log(`Generated ${scenes.length} storyboard frames in ${outDir}`);

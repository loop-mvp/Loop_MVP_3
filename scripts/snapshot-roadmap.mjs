import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ROADMAP_PATH = path.join(ROOT, "docs", "ROADMAP.md");
const ROADMAPS_DIR = path.join(ROOT, "docs", "roadmaps");
const CHANGELOG_PATH = path.join(ROOT, "CHANGELOG.md");

function getArgValue(flag) {
  const prefix = `${flag}=`;
  const match = process.argv.find(arg => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content.replace(/\r?\n/g, "\n"), "utf8");
}

function buildSnapshotContent(roadmapContent, version) {
  const body = roadmapContent
    .replace(/^# Roadmap\s*$/m, `# Roadmap Snapshot v${version}`)
    .replace(/^Current roadmap for Loop MVP 3\.\s*$/m, `This file captures the roadmap state as of \`${version}\`.`);
  return body.includes("This file captures the roadmap state as of")
    ? body
    : `# Roadmap Snapshot v${version}\n\nThis file captures the roadmap state as of \`${version}\`.\n\n${body}`;
}

function updateRoadmapPointers(roadmapContent, version) {
  const snapshotLink = `[docs/roadmaps/ROADMAP_v${version}.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v${version}.md)`;
  let next = roadmapContent;
  next = next.replace(/- Current version: `[^`]+`/, `- Current version: \`${version}\``);
  next = next.replace(/- Snapshot file: \[[^\]]+\]\([^)]+\)/, `- Snapshot file: ${snapshotLink}`);

  if (!next.includes("npm run roadmap:snapshot")) {
    next = next.replace(
      "4. add a short note in [CHANGELOG.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/CHANGELOG.md)\n",
      "4. add a short note in [CHANGELOG.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/CHANGELOG.md)\n5. prefer running `npm run roadmap:snapshot` so the snapshot, pointers, and changelog note stay in sync\n"
    );
  }

  return next;
}

function ensureDateSection(changelogContent, version) {
  if (changelogContent.includes(`## ${version}`)) return changelogContent;
  return `${changelogContent.trimEnd()}\n\n## ${version}\n\n### Documentation / Repo\n\n- Roadmap snapshot created.\n`;
}

function ensureDocumentationSectionInDateBlock(block) {
  if (block.includes("\n### Documentation / Repo\n")) return block;
  return `${block.trimEnd()}\n\n### Documentation / Repo\n\n`;
}

function updateChangelog(changelogContent, version) {
  const snapshotBullet = `- Roadmap snapshot updated: [docs/roadmaps/ROADMAP_v${version}.md](C:/Users/mayanktrivedi/loop/loop-app-codex-main/Loop_MVP_3/docs/roadmaps/ROADMAP_v${version}.md)`;
  let next = ensureDateSection(changelogContent, version);
  if (next.includes(snapshotBullet)) return next;

  const dateHeader = `## ${version}`;
  const nextDateIndex = next.indexOf("\n## ", next.indexOf(dateHeader) + dateHeader.length);
  const blockStart = next.indexOf(dateHeader);
  const blockEnd = nextDateIndex === -1 ? next.length : nextDateIndex;
  const block = next.slice(blockStart, blockEnd);
  const normalizedBlock = ensureDocumentationSectionInDateBlock(block);
  const updatedBlock = normalizedBlock.replace("### Documentation / Repo\n\n", `### Documentation / Repo\n\n${snapshotBullet}\n`);

  return `${next.slice(0, blockStart)}${updatedBlock}${next.slice(blockEnd)}`;
}

function main() {
  const version = getArgValue("--date") || getToday();
  ensureFile(ROADMAP_PATH);
  ensureFile(CHANGELOG_PATH);
  fs.mkdirSync(ROADMAPS_DIR, { recursive: true });

  const roadmapContent = fs.readFileSync(ROADMAP_PATH, "utf8");
  const changelogContent = fs.readFileSync(CHANGELOG_PATH, "utf8");
  const snapshotPath = path.join(ROADMAPS_DIR, `ROADMAP_v${version}.md`);

  writeFile(snapshotPath, buildSnapshotContent(roadmapContent, version));
  writeFile(ROADMAP_PATH, updateRoadmapPointers(roadmapContent, version));
  writeFile(CHANGELOG_PATH, updateChangelog(changelogContent, version));

  process.stdout.write(`Roadmap snapshot created: ${snapshotPath}\n`);
}

main();

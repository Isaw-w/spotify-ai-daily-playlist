import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(projectRoot, "extension", "spotify-ai-daily-playlist.js");
const base = process.platform === "win32"
  ? path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "spicetify")
  : path.join(os.homedir(), ".config", "spicetify");
const destinationDir = path.join(base, "Extensions");
const destination = path.join(destinationDir, "spotify-ai-daily-playlist.js");
const skillSource = path.join(projectRoot, "skills", "spotify-daily-playlist");
const codexSkill = path.join(os.homedir(), ".codex", "skills", "spotify-daily-playlist");
const claudeSkill = path.join(os.homedir(), ".claude", "skills", "spotify-daily-playlist");

fs.mkdirSync(destinationDir, { recursive: true });
fs.copyFileSync(source, destination);
for (const skillDestination of [codexSkill, claudeSkill]) {
  fs.mkdirSync(path.dirname(skillDestination), { recursive: true });
  fs.cpSync(skillSource, skillDestination, { recursive: true, force: true });
}
const profile = path.join(projectRoot, "data", "profile.md");
if (!fs.existsSync(profile)) fs.copyFileSync(path.join(projectRoot, "data", "profile.example.md"), profile);

for (const args of [["config", "extensions", "spotify-ai-daily-playlist.js"], ["apply"]]) {
  const result = spawnSync("spicetify", args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error || result.status !== 0) {
    console.error("Spicetify could not be configured automatically. See the manual installation steps in README.md.");
    process.exit(1);
  }
}
console.log(`Installed Spotify AI Daily Playlist for Codex and Claude Code.\nEdit ${profile} to describe your taste.`);

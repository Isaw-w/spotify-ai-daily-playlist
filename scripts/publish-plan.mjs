import fs from "node:fs";
import path from "node:path";
import { localDateKey, validatePlan } from "../lib/plan.mjs";

const source = path.resolve(process.argv[2] || "data/plan.candidate.json");
const destination = path.resolve("data/plan.json");
let plan;
try {
  plan = JSON.parse(fs.readFileSync(source, "utf8"));
} catch (error) {
  console.error(`Could not read ${source}: ${error.message}`);
  process.exit(1);
}

plan.date = plan.date || localDateKey();
plan.generatedAt = new Date().toISOString();
plan.dryRun = false;
const errors = validatePlan(plan);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
const temporary = `${destination}.tmp`;
fs.writeFileSync(temporary, `${JSON.stringify(plan, null, 2)}\n`);
fs.renameSync(temporary, destination);
console.log(`Published ${plan.tracks.length} tracks for ${plan.date}.`);

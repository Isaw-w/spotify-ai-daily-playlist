import fs from "node:fs";
import { validatePlan } from "../lib/plan.mjs";

const file = process.argv[2] || "data/plan.json";
let plan;
try {
  plan = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Could not read ${file}: ${error.message}`);
  process.exit(1);
}

const errors = validatePlan(plan);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Valid: ${plan.tracks.length} tracks for ${plan.date}.`);

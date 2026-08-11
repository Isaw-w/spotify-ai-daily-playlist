import test from "node:test";
import assert from "node:assert/strict";
import { localDateKey, validatePlan } from "../lib/plan.mjs";

function track(index, role = "bridge", artist = `Artist ${index}`) {
  return {
    uri: `spotify:track:${String(index).padStart(22, "0")}`,
    name: `Track ${index}`,
    artists: [artist],
    role,
    reason: "A clear musical connection.",
  };
}

test("accepts a valid daily plan", () => {
  const date = localDateKey();
  const plan = {
    date,
    playlist: { name: "Quiet Worlds" },
    tracks: Array.from({ length: 13 }, (_, index) => track(index + 1)),
  };
  assert.deepEqual(validatePlan(plan), []);
});

test("rejects duplicates and artist saturation", () => {
  const date = localDateKey();
  const tracks = Array.from({ length: 8 }, (_, index) => track(index + 1, "bridge", index < 3 ? "Same Artist" : `Artist ${index}`));
  tracks[7].uri = tracks[0].uri;
  const errors = validatePlan({ date, playlist: { name: "Daily" }, tracks });
  assert.ok(errors.some((error) => error.includes("duplicated")));
  assert.ok(errors.some((error) => error.includes("maximum is 2")));
});

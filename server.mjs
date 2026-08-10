import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { localDateKey, validatePlan } from "./lib/plan.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, "data");
const planPath = path.join(dataDir, "plan.json");
const statusPath = path.join(dataDir, "status.json");
const historyPath = path.join(dataDir, "history.json");
const port = Number(process.env.QUIET_WORLDS_PORT || 8766);

function json(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body, null, 2));
}

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function recordHistory(status) {
  if (status?.state !== "complete" || !Array.isArray(status?.selection)) return;
  const history = readJson(historyPath, []);
  const withoutToday = history.filter((entry) => entry.date !== status.date);
  withoutToday.push({ date: status.date, tracks: status.selection });
  fs.writeFileSync(historyPath, `${JSON.stringify(withoutToday.slice(-30), null, 2)}\n`);
}

const server = http.createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "content-type");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (request.method === "OPTIONS") return response.writeHead(204).end();

  if (request.method === "GET" && request.url === "/health") {
    return json(response, 200, { ok: true, date: localDateKey() });
  }
  if (request.method === "GET" && request.url === "/plan") {
    const plan = readJson(planPath);
    const errors = validatePlan(plan);
    return errors.length ? json(response, 422, { errors }) : json(response, 200, plan);
  }
  if (request.method === "GET" && request.url === "/status") {
    return json(response, 200, readJson(statusPath, { state: "waiting" }));
  }
  if (request.method === "POST" && request.url === "/status") {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      try {
        const status = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        fs.writeFileSync(statusPath, `${JSON.stringify(status, null, 2)}\n`);
        recordHistory(status);
        json(response, 200, { ok: true });
      } catch {
        json(response, 400, { error: "Invalid JSON." });
      }
    });
    return;
  }
  json(response, 404, { error: "Not found." });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Spotify AI Daily Playlist is ready at http://127.0.0.1:${port}`);
});

const TRACK_URI = /^spotify:track:[A-Za-z0-9]{22}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function localDateKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function validatePlan(plan, { expectedDate = localDateKey() } = {}) {
  const errors = [];
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) return ["Plan must be a JSON object."];
  if (!DATE.test(plan.date || "")) errors.push("date must use YYYY-MM-DD.");
  if (expectedDate && plan.date !== expectedDate) errors.push(`date must be ${expectedDate}.`);
  if (!plan.playlist || typeof plan.playlist !== "object") errors.push("playlist is required.");
  if (!String(plan.playlist?.name || "").trim()) errors.push("playlist.name is required.");
  if (!Array.isArray(plan.tracks)) errors.push("tracks must be an array.");

  const tracks = Array.isArray(plan.tracks) ? plan.tracks : [];
  if (tracks.length < 8 || tracks.length > 20) errors.push("tracks must contain 8–20 selections.");
  const seen = new Set();
  for (const [index, track] of tracks.entries()) {
    const at = `tracks[${index}]`;
    if (!TRACK_URI.test(track?.uri || "")) errors.push(`${at}.uri must be a Spotify track URI.`);
    if (seen.has(track?.uri)) errors.push(`${at}.uri is duplicated.`);
    seen.add(track?.uri);
    if (!String(track?.name || "").trim()) errors.push(`${at}.name is required.`);
    if (!Array.isArray(track?.artists) || !track.artists.length) errors.push(`${at}.artists is required.`);
    if (!String(track?.reason || "").trim()) errors.push(`${at}.reason is required.`);
    if (!['anchor', 'bridge', 'discovery'].includes(track?.role)) errors.push(`${at}.role must be anchor, bridge, or discovery.`);
  }

  const artistCounts = new Map();
  for (const track of tracks) {
    const artist = String(track?.artists?.[0] || "").trim().toLowerCase();
    if (artist) artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
  }
  for (const [artist, count] of artistCounts) {
    if (count > 2) errors.push(`Primary artist “${artist}” appears ${count} times; maximum is 2.`);
  }
  return errors;
}

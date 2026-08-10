/* Spotify AI Daily Playlist — local recommendations for Spicetify. MIT License. */
(function spotifyAiDailyPlaylist() {
  const S = globalThis.Spicetify;
  if (!S?.Platform?.RootlistAPI || !S?.Platform?.PlaylistAPI) {
    setTimeout(spotifyAiDailyPlaylist, 400);
    return;
  }

  const endpoint = "http://127.0.0.1:8766";
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function flatten(items, output = []) {
    for (const item of items || []) {
      if (item.type === "playlist" && item.uri) output.push(item);
      if (item.items) flatten(item.items, output);
    }
    return output;
  }

  async function report(body) {
    try {
      await fetch(`${endpoint}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedAt: new Date().toISOString(), ...body }),
      });
    } catch (error) {
      console.warn("Spotify AI Daily Playlist status report failed", error);
    }
  }

  async function findOrCreate(name) {
    const root = await S.Platform.RootlistAPI.getContents();
    const found = flatten(root?.items).find((item) => (item.name || item.title) === name);
    if (found?.uri) return found.uri;
    const uri = await S.Platform.RootlistAPI.createPlaylist(name, { before: "start" });
    if (!uri?.startsWith?.("spotify:playlist:")) throw new Error("Could not create the daily playlist.");
    return uri;
  }

  async function applyPlan(plan) {
    if (plan.dryRun) return;
    const signature = `${plan.date}:${plan.generatedAt || plan.tracks.map((track) => track.uri).join(",")}`;
    if (localStorage.getItem("spotifyAiDailyPlaylist:applied") === signature) return;

    const playlistUri = await findOrCreate(plan.playlist.name);
    const contents = await S.Platform.PlaylistAPI.getContents(playlistUri, { limit: 1000 });
    const current = (contents?.items || [])
      .map((item) => item?.track || item?.item || item)
      .filter((item) => item?.uri?.startsWith("spotify:track:"))
      .map((item) => ({ uri: item.uri, uid: [] }));
    if (current.length) await S.Platform.PlaylistAPI.remove(playlistUri, current);
    await S.Platform.PlaylistAPI.add(playlistUri, plan.tracks.map((track) => track.uri), { before: "end" });

    const verified = await S.Platform.PlaylistAPI.getContents(playlistUri, { limit: 1000 });
    const present = new Set((verified?.items || [])
      .map((item) => item?.track || item?.item || item)
      .map((item) => item?.uri)
      .filter(Boolean));
    const selection = plan.tracks.filter((track) => present.has(track.uri));
    if (selection.length !== plan.tracks.length) throw new Error("One or more recommended tracks were unavailable.");

    localStorage.setItem("spotifyAiDailyPlaylist:applied", signature);
    await report({
      state: "complete",
      date: plan.date,
      playlistId: playlistUri.split(":").at(-1),
      selection: selection.map(({ uri, name, artists, role }) => ({ uri, name, artists, role })),
    });
    S.showNotification(`AI Daily Playlist: ${selection.length} tracks ready`);
  }

  async function refresh() {
    try {
      const response = await fetch(`${endpoint}/plan`, { cache: "no-store" });
      if (!response.ok) return;
      await applyPlan(await response.json());
    } catch {
      // The helper is intentionally optional between refreshes.
    }
  }

  async function start() {
    await sleep(1200);
    await refresh();
    setInterval(refresh, 60_000);
  }
  start();
})();

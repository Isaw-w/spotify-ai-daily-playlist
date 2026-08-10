---
name: spotify-daily-playlist
description: Create or refresh an AI-recommended daily Spotify playlist from a listener-written taste profile using the local Spotify AI Daily Playlist project. Use when the listener asks for today's Spotify playlist, daily music recommendations, taste cultivation, or a daily playlist refresh. Never modify Liked Songs, followed artists, or playlists other than the configured daily playlist.
---

# Spotify AI Daily Playlist

Create one small daily Spotify playlist that balances trusted foundations with meaningful discovery. Operate entirely through the local project checkout and the listener's existing Spotify desktop session. Do not request Spotify OAuth credentials or use a hosted service.

## Workflow

1. Locate the Spotify AI Daily Playlist checkout. Confirm its `package.json` has `"name": "spotify-ai-daily-playlist"`. Work only inside that checkout.
2. Read `data/profile.md`. If it is missing, copy `data/profile.example.md`, ask the listener to describe at least three foundations and their exclusions, then stop.
3. Read `data/history.json` when present. Avoid tracks used during the previous seven days unless the profile explicitly asks for recurring anchors.
4. Select the number of tracks requested by the profile, defaulting to 13: roughly four anchors, six bridges, and three discoveries. Treat exclusions as hard constraints. Keep seasonal music within its season. Use at most two tracks with the same primary artist.
5. Search Spotify's current catalogue. Record an exact `spotify:track:` URI only after finding the exact title and performer. When a signed-in browser is available, prefer results with an enabled Play button. Never invent an identifier or silently substitute a cover.
6. Write `data/plan.candidate.json` according to [references/plan-schema.md](references/plan-schema.md). Give each recommendation a short, musically specific reason.
7. Run `node scripts/publish-plan.mjs data/plan.candidate.json`. Fix every validation error. This publishes the plan atomically; do not write `data/plan.json` by hand.
8. Ensure `node server.mjs` is running locally. Ask before restarting Spotify when the environment requires approval. Wait for `data/status.json` to report `state: complete`, then verify that every proposed URI appears in `selection`.
9. Report the playlist link, the anchor/bridge/discovery balance, and any unavailable tracks that had to be replaced.

## Boundaries

- Modify only the playlist named in `plan.playlist.name`.
- Never delete playlists, remove saved tracks, follow or unfollow artists, or change playback.
- Keep the profile, plan, history, and status local and uncommitted.
- Do not call an external AI API; the active Codex or Claude Code session is the recommender.
- Prefer a satisfying coherent path over popularity, genre coverage, or novelty for its own sake.

# Spotify AI Daily Playlist

Get one AI-recommended Spotify playlist every day. Codex or Claude Code reads a taste profile you write, finds exact playable tracks, and sends the finished selection to Spotify through a small local Spicetify extension.

No Spotify OAuth app, hosted backend, analytics, advertising, or separate AI API bill.

## Install

Requirements: Spotify desktop, [Spicetify](https://spicetify.app/docs/getting-started/), Node.js 20+, and Codex or Claude Code.

```sh
git clone https://github.com/Isaw-w/spotify-ai-daily-playlist.git
cd spotify-ai-daily-playlist
npm run install-extension
```

Edit `data/profile.md`, then start the local helper:

```sh
npm start
```

Invoke `$spotify-daily-playlist` in Codex or `/spotify-daily-playlist` in Claude Code.

## What the AI selects

The default daily list has 13 tracks: four familiar anchors, six close bridges, and three bolder discoveries. Your foundations, atmosphere, exclusions, and seasonal rules are written in plain language. Recommendations used during the previous seven days are avoided unless your profile asks for recurring anchors.

## Privacy and safety

Your profile, plan, history, and status stay local and are ignored by Git. The extension can replace only the configured daily playlist. It has no functions for removing Liked Songs, deleting other playlists, or following and unfollowing artists.

## Test

```sh
npm test
```

MIT licensed. Spotify, Spicetify, OpenAI, Codex, Anthropic, and Claude are trademarks of their respective owners. This independent project is not affiliated with or endorsed by them.

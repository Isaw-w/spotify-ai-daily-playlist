# Daily plan schema

Write UTF-8 JSON with this shape:

```json
{
  "date": "YYYY-MM-DD",
  "playlist": {
    "name": "Today — Quiet Worlds",
    "description": "A short description"
  },
  "tracks": [
    {
      "uri": "spotify:track:22_BASE62_CHARACTERS",
      "name": "Exact Spotify title",
      "artists": ["Exact Spotify artist"],
      "role": "anchor",
      "reason": "A brief, musically specific connection to the profile."
    }
  ]
}
```

`role` must be `anchor`, `bridge`, or `discovery`. Include 8–20 unique tracks and no more than two tracks by one primary artist. The publisher adds `generatedAt` and sets `dryRun` to false after validation.

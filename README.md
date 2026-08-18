# Songscape

Songscape is a private, browser-local archive for songs and the memories attached to them. It keeps not only titles, but why you return to each song and the people, places, and periods of life it holds.

## Features

- Add, edit, delete, cherish, and un-cherish songs
- Search titles, artists, reflections, and tags
- Filter by tag and cherished status
- Read each song as an individual exhibit
- “Show Me Something” uniformly selects from the visible collection and avoids an immediate repeat
- Deterministic SVG fingerprints generated from each entry’s stable seed, mood, energy, and warmth
- Local persistence through `localStorage`; no account, backend, or music service required
- JSON export and validated, confirmation-gated replacement import
- Responsive layouts, keyboard support, visible focus states, and reduced-motion support

## Run locally

There are no dependencies and no build step. Serve the directory with any static server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. Opening `index.html` directly may also work, but some browsers restrict ES modules on `file://`, so a static server is more reliable.

## Data and backups

The collection is stored in `localStorage` for the current browser and site origin under `songscape.collection.v1`. Clearing browser data removes it, so export a JSON backup regularly from the Backup panel before long-term use.

Import accepts structurally valid Songscape backups. It validates every entry and asks for explicit confirmation before replacing the current collection.

## Project structure

- `index.html` — semantic page, form, and dialog structure
- `styles.css` — visual system, responsive behavior, and accessibility styles
- `app.js` — normalization, storage, filtering, fingerprint generation, and UI coordination
- `README.zh-CN.md` — Chinese documentation
- `README.md` — English documentation

## Known limitations

- V1 stores artwork URLs only. Remote artwork may be unavailable offline; fingerprints and all core features continue to work.
- Data remains on the current device and browser; there is no cloud sync.
- JSON import replaces the full collection rather than merging it, after explicit confirmation.

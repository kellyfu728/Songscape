# Songscape

Songscape is a private, browser-local listening room for songs and the memories attached to them. It keeps not only titles, but why you return to each song and the people, places, and periods of life it holds.

V2 presents the collection as a virtual used-media store. Each song can become vinyl, cassette, CD, or DVD media that can be pulled out, opened, and inspected with its liner notes.

V4 rebuilds the interface as a believable vintage record shop: a walnut-lined room with album walls, wooden shelves, digging crates, a listening table, analog equipment, localized light, and format-specific handling. It also adds a nine-step introduction tracked separately per language and fixes bilingual branding at every breakpoint.

## Features

- Add, edit, delete, cherish, and un-cherish songs
- Search titles, artists, reflections, and tags
- Filter by tag and cherished status
- Pull vinyl, cassette, CD, and DVD objects from shelves with distinct opening motion
- Examine each song on a listening table with liner notes, associations, tags, and fingerprint details
- “Dig through the crate” uniformly selects from the visible collection and avoids an immediate repeat
- Deterministic SVG fingerprints generated from each entry’s stable seed, mood, energy, and warmth
- Local persistence through `localStorage`; no account, backend, or music service required
- JSON export and validated, confirmation-gated replacement import
- Responsive layouts, keyboard support, visible focus states, and reduced-motion support

## Run locally

The final `index.html` contains its CSS and JavaScript, so it can be opened directly on Windows or macOS. It can also be served with any static server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`. The shipped standalone file does not require modules or external assets, so direct opening is supported too.

## Data and backups

The collection is stored in `localStorage` for the current browser and site origin under `songscape.collection.v1`. Clearing browser data removes it, so export a JSON backup regularly from the Backup panel before long-term use.

Import accepts structurally valid Songscape backups. It validates every entry and asks for explicit confirmation before replacing the current collection.

## Project structure

- `index.html` — semantic page, form, and dialog structure
- `styles.css` — visual system, responsive behavior, and accessibility styles
- `v2.css`, `v3.css`, `critical.css`, `v4.css` — successive store, interaction, localization, and environmental design layers
- `app.js` — normalization, storage, filtering, fingerprint generation, and UI coordination
- `README.zh-CN.md` — Chinese documentation
- `README.md` — English documentation

## Known limitations

- V1 stores artwork URLs only. Remote artwork may be unavailable offline; fingerprints and all core features continue to work.
- Data remains on the current device and browser; there is no cloud sync.
- JSON import replaces the full collection rather than merging it, after explicit confirmation.

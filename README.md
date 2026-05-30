# beezz_zart

Static website for **Beezz_zart** / Back2LifeInk — blackwork tattoo flashes and booking (Toronto).

## Structure

- `index.html` — homepage
- `flashes.html` — style picker and flash browsing flow
- `flashes-gallery.html` — flash grid
- `flash-quote.html` — quote form (Fillout)
- `styles.css`, `script.js`, `flashes-*.js` — UI and catalog
- `Website Images/` — photos and flash assets

## Local preview

Open `index.html` in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy

This repo is plain HTML/CSS/JS. Host on **GitHub Pages**, Netlify, Cloudflare Pages, or any static host by pointing the site root at this folder.

# drisswz.fr

Rebuild static de drisswz.fr.

Stack
- Vite
- GSAP ScrollTrigger
- HTML / CSS / JS
- video local: `/public/video/drisswzsitevideo.mp4`

Pages
- `/`
- `/cv/`
- `/portfolio/`

Run
```bash
npm install
npm run dev
```

Build
```bash
npm run build
```

Deploy Hostinger
- branch Git: `main` ou branche dédiée selon config Hostinger
- build command: `npm run build`
- publish dir: `dist`
- verify video asset present in `dist/video/`

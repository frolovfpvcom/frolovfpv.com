# frolovfpv.com

Website for Frolov FPV, built with Next.js and deployed on Vercel (every push to `main` goes live).

## Pages

| URL | Page |
| --- | --- |
| `/` | Forside: video, showreel, udvalgt arbejde, ydelser, proces, om mig og call to action |
| `/arbejde` | Alle projekter og det lille klip-arkiv med mapperne |
| `/ydelser` | De fire ydelser med billede/video og spørgsmål og svar |
| `/om` | Om Peter |
| `/kontakt` | Kontaktformular |
| `/cookies` | Cookiepolitik |

All text is Danish with an English version; the DA/EN switch is in the menu. Each component keeps its texts in a `{ da, en }` object at the top of the file.

## Adding photos and videos

Every picture and video slot is listed in [`src/lib/media.ts`](src/lib/media.ts). An empty slot shows a neat "Plads til video" placeholder.

1. Put the file in `public/media/` (for example `public/media/showreel.mp4`).
2. In `src/lib/media.ts`, write the path in the slot: `video: "/media/showreel.mp4"` or `image: "/media/bil.jpg"`.
3. For videos, also add a still frame as `image`, so something shows while the video loads.

Keep web videos short and compressed (under ~10 MB each, H.264 MP4) so the site stays fast.

The clip folders on `/arbejde` are set up in [`src/components/sections/clip-archive.tsx`](src/components/sections/clip-archive.tsx).

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

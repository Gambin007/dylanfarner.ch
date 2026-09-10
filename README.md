# dylanfarner.ch

Foto-Portfolio von Dylan Farner. Next.js (App Router) + TypeScript + Tailwind CSS, Deploy auf Vercel.

## Seiten

| Route      | Inhalt                                                     |
| ---------- | ---------------------------------------------------------- |
| `/`        | Fullscreen-Carousel, horizontal (Drag, Klick, Pfeiltasten) |
| `/gallery` | Dieselben Slides untereinander                             |
| `/about`   | Kontakt, Bio, Kunden, Copyright                            |

## Setup

```bash
npm install
npm run dev
```

## Bilder

`public/photos/` enthält die **Web-Versionen** (max. 2800px Längsseite, ~39 MB total).
Die unveränderten Originale liegen in `_originals/` und sind aus Git ausgeschlossen –
sie sind ~500 MB gross und würden weder durch einen Git-Push noch durch einen
Vercel-Build passen.

Neues Bild hinzufügen:

```bash
sips -Z 2800 -s format jpeg -s formatOptions 85 _originals/NEU.jpg --out public/photos/neu.jpg
```

Dateinamen klein, ohne Leerzeichen und ohne Umlaute halten – sie landen direkt in der URL.

## Reihenfolge, Gruppierung und Titel

`src/data/photo-groups.json` ist die einzige Stelle, die von Hand gepflegt wird:
eine Liste von Slides, jeder Slide eine Liste von Bildern. Auf der Startseite
füllt ein Slide genau eine Bildschirmseite, `title` steht als Bildunterschrift
darunter.

```json
[
  [{ "file": "naru.jpg", "title": "Naru" }],
  [
    { "file": "dedelley-1.jpg", "title": "Dedelley 1" },
    { "file": "dedelley-2.jpg", "title": "Dedelley 2" }
  ]
]
```

Die Titel sind aus den Dateinamen vorbefüllt und dürfen frei überschrieben werden –
sie überleben jeden `npm run photos`-Lauf.

Danach:

```bash
npm run photos
```

Das liest die Bildmasse aus und schreibt `src/data/photos.generated.ts` – diese Datei
nie von Hand bearbeiten, sie wird bei jedem Lauf überschrieben.

## Deploy

Repo auf GitHub pushen → auf vercel.com importieren. Keine Konfiguration nötig,
Vercel erkennt Next.js selber. Domain danach unter Project → Settings → Domains.

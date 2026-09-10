// Liest src/data/photo-groups.json (Reihenfolge, Gruppierung und Titel, von Hand gepflegt),
// wobei "title" weggelassen werden darf, wenn ein Bild keine Unterschrift bekommen soll.
// holt die Bildmasse aus public/photos/ und schreibt src/data/photos.generated.ts.
// Next/Image braucht width+height, um das Layout vor dem Laden zu reservieren.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";

const PHOTO_DIR = join(process.cwd(), "public", "photos");
const GROUPS_FILE = join(process.cwd(), "src", "data", "photo-groups.json");
const OUT_FILE = join(process.cwd(), "src", "data", "photos.generated.ts");

const groups = JSON.parse(readFileSync(GROUPS_FILE, "utf8"));

const slides = groups.map((group) =>
  group.map(({ file, title }) => {
    const { width, height } = imageSize(readFileSync(join(PHOTO_DIR, file)));
    if (!width || !height) {
      throw new Error(`Konnte die Dimensionen von ${file} nicht lesen.`);
    }
    // Ohne Titel bleibt die Bildunterschrift leer, das alt-Attribut braucht trotzdem Text.
    const alt = title ?? file.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    return { src: `/photos/${file}`, width, height, alt, title: title ?? null };
  }),
);

const contents = `// Auto-generiert von scripts/generate-photos.mjs – nicht von Hand bearbeiten.
// Titel und Reihenfolge werden in photo-groups.json gepflegt.
import type { Slide } from "./photos";

export const slides: Slide[] = ${JSON.stringify(slides, null, 2)};
`;

writeFileSync(OUT_FILE, contents);
console.log(`${slides.length} Slides, ${slides.flat().length} Fotos → src/data/photos.generated.ts`);

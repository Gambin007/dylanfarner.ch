import Image from "next/image";
import type { Slide } from "@/data/photos";

/** Muss zur gap-4-Klasse der Reihe passen. */
const GAP_REM = 1;

/** Platz, den die Bildunterschrift unter der Reihe braucht. */
const CAPTION_REM = 2;

type SlideRowProps = {
  slide: Slide;
  /** CSS-Länge, die Bild plus Unterschrift in der Höhe nicht überschreiten dürfen. Ohne Prozentwerte. */
  maxHeight: string;
  /** CSS-Länge, die die Reihe in der Breite nicht überschreiten darf. */
  maxWidth: string;
  priority?: boolean;
};

export default function SlideRow({ slide, maxHeight, maxWidth, priority = false }: SlideRowProps) {
  const ratios = slide.map((photo) => photo.width / photo.height);
  const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
  const gap = (slide.length - 1) * GAP_REM;

  // flex-grow verteilt nur dann den ganzen freien Platz, wenn die Summe aller
  // Werte mindestens 1 ist – bei einem einzelnen Hochformat wäre sie 0.67.
  // Deshalb werden die Seitenverhältnisse auf die Summe slide.length skaliert.
  const growScale = slide.length / totalRatio;

  // Die Reihe wird so breit wie möglich – begrenzt entweder durch den Container
  // oder durch die Höhe, die den Bildern bleibt (Breite = Höhe × Seitenverhältnis).
  const imageHeight = `calc(${maxHeight} - ${CAPTION_REM}rem)`;
  const width = `min(${maxWidth}, calc(${imageHeight} * ${totalRatio} + ${gap}rem))`;

  // Tragen alle Bilder einer Serie denselben Titel, ist es ein Serientitel und steht
  // einmal darunter – dreimal derselbe Text nebeneinander wäre nur Wiederholung.
  const seriesTitle = slide.every((photo) => photo.title && photo.title === slide[0].title)
    ? slide[0].title
    : null;

  return (
    <figure style={{ width }}>
      <div className="flex gap-4">
        {slide.map((photo, index) => (
          // Breite im Verhältnis des Seitenverhältnisses + aspect-ratio pro Bild:
          // dadurch stehen alle Bilder einer Gruppe automatisch exakt gleich hoch.
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            priority={priority}
            sizes={`${Math.round((ratios[index] / totalRatio) * 100)}vw`}
            draggable={false}
            className="h-auto w-full min-w-0 object-contain"
            style={{ flexGrow: ratios[index] * growScale, flexBasis: 0, aspectRatio: ratios[index] }}
          />
        ))}
      </div>

      <figcaption className="mt-2 flex gap-4 text-xs sm:text-sm">
        {seriesTitle ? (
          <span className="truncate">{seriesTitle}</span>
        ) : (
          slide.map((photo, index) => (
            // Dieselbe Breitenaufteilung wie bei den Bildern, damit jede Unterschrift
            // unter ihrem eigenen Bild steht.
            <span
              key={photo.src}
              className="min-w-0 truncate"
              style={{ flexGrow: ratios[index] * growScale, flexBasis: 0 }}
            >
              {photo.title}
            </span>
          ))
        )}
      </figcaption>
    </figure>
  );
}

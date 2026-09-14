"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Photo } from "@/data/photos";

/** Wie stark eine Kachel beim Überfahren wächst. */
const HOVER_SCALE = 3.63;

/**
 * Setzt die Bildunterschrift an die linke untere Ecke des vergrösserten Bildes,
 * gerechnet ab der Mitte der unskalierten Zelle. Sie sitzt bewusst ausserhalb des
 * skalierten Elements, sonst würde der Text mitvergrössert.
 *
 * Das Bild steht mit object-contain in einem Quadrat und füllt es deshalb nur in
 * einer Richtung – wo seine Kanten liegen, hängt am Seitenverhältnis.
 */
function captionPosition(photo: Photo) {
  const ratio = photo.width / photo.height;
  const visibleWidth = Math.min(ratio, 1) * HOVER_SCALE;
  const visibleHeight = Math.min(1 / ratio, 1) * HOVER_SCALE;
  return {
    left: `calc(50% - ${(visibleWidth / 2) * 100}%)`,
    top: `calc(50% + ${(visibleHeight / 2) * 100}% + 0.5rem)`,
  };
}

export default function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [openPhoto, setOpenPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!openPhoto) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPhoto(null);
    }
    window.addEventListener("keydown", onKeyDown);

    // Die Seite darf hinter der Lightbox nicht mitscrollen.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openPhoto]);

  return (
    <div className="group/gallery">
      {/*
        Legt sich beim Überfahren einer Kachel über die ganze Seite – auch über die
        Navigation, die z-50 trägt. Die vergrösserte Kachel liegt mit z-70 darüber.
      */}
      <div className="pointer-events-none fixed inset-0 z-60 bg-black/70 opacity-0 transition-opacity duration-300 group-has-[figure:hover]/gallery:opacity-100" />

      {/* overflow-x-clip, weil die vergrösserten Kacheln am Rand sonst horizontal scrollen lassen. */}
      <div className="grid grid-cols-3 gap-x-10 gap-y-10 overflow-x-clip px-6 py-32 sm:grid-cols-4 sm:gap-x-20 sm:px-24 md:grid-cols-6 md:gap-x-32 md:gap-y-20 md:px-32">
        {photos.map((photo) => (
          <figure key={photo.src} className="group/tile relative aspect-square hover:z-70">
            {/* Nur das Bild wird skaliert, damit die Unterschrift ihre Grösse behält. */}
            <button
              type="button"
              onClick={() => setOpenPhoto(photo)}
              aria-label={`${photo.title ?? photo.alt} gross anzeigen`}
              className="relative block h-full w-full cursor-zoom-in transition-[scale,filter] duration-300 ease-out group-hover/tile:scale-[3.63] group-hover/tile:drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 30vw, 20vw"
                className="object-contain"
              />
            </button>

            {photo.title && (
              <figcaption
                className="pointer-events-none absolute text-left text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100"
                style={captionPosition(photo)}
              >
                {photo.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {openPhoto && (
        // Klick irgendwohin schliesst wieder, genauso Escape.
        <div
          role="dialog"
          aria-modal="true"
          aria-label={openPhoto.title ?? openPhoto.alt}
          onClick={() => setOpenPhoto(null)}
          className="fixed inset-0 z-80 flex cursor-zoom-out flex-col items-center justify-center gap-4 bg-black/95 p-6"
        >
          <Image
            src={openPhoto.src}
            alt={openPhoto.alt}
            width={openPhoto.width}
            height={openPhoto.height}
            sizes="90vw"
            priority
            className="h-auto max-h-[85svh] w-auto max-w-[90vw] object-contain"
          />
          {openPhoto.title && <p className="text-xs text-white">{openPhoto.title}</p>}
        </div>
      )}
    </div>
  );
}

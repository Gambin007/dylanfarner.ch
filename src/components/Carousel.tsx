"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import SlideRow from "@/components/SlideRow";
import type { Slide } from "@/data/photos";

/** Ab dieser Distanz gilt eine Mausbewegung als Ziehen und nicht als Klick. */
const DRAG_THRESHOLD_PX = 5;

/** Ruhezeit nach dem letzten Rad-Ereignis, nach der auf eine Serie eingerastet wird. */
const WHEEL_SETTLE_MS = 220;

/** Dauer der Scroll-Animation in Sekunden. Auch die Wartezeit, bis Snapping zurückdarf. */
const SCROLL_DURATION = 1;

/** Anteil einer Bildschirmbreite, ab dem eine Radbewegung als Weiterblättern zählt. */
const SETTLE_THRESHOLD = 0.15;

/**
 * Grösster Weg, den ein einzelnes Rad-Ereignis beisteuern darf. Trackpads schicken
 * viele kleine Werte, manche Mäuse dagegen einen sehr grossen pro Rastung – ohne
 * Deckel ruckt das Karussell bei denen sprunghaft weiter.
 */
const MAX_DELTA_PX = 180;

/** Manche Mäuse melden Zeilen statt Pixel (deltaMode 1); so viele Pixel ist eine Zeile. */
const LINE_HEIGHT_PX = 16;

/** Nachlauf des eigenen Cursors in Sekunden. */
const CURSOR_DURATION = 0.25;

/** Abstand des Cursor-Texts zum Zeiger, damit er nicht darunter klebt. */
const CURSOR_OFFSET_PX = 14;

/**
 * Wie oft die Serien hintereinander gerendert werden. Drei Kopien reichen: gescrollt
 * wird in der mittleren, die beiden äusseren sind der Vorrat nach links und rechts.
 */
const LOOP_COPIES = 3;

export default function Carousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef({ startX: 0, startScrollLeft: 0, distance: 0, active: false });

  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    // Ein Slide ist genau eine Spurbreite breit, also ergibt sich der Index direkt aus
    // der Scroll-Position. Das trifft die Serie auch dann, wenn ein Ziehen zwischen
    // zwei Slides geendet hat.
    const current = Math.round(track.scrollLeft / track.clientWidth);
    const target = Math.min(Math.max(current + direction, 0), track.children.length - 1);
    track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  // Vertikales Scrollen bewegt das Karussell zur Seite, und zwar endlos.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length === 0) return;

    let wheeling = false;
    let originIndex = 0;
    let target = 0;
    let settleTimer = 0;
    let restoreSnapTimer = 0;

    /**
     * Beim Verlassen der mittleren Kopie um genau eine Kopienbreite zurücksetzen.
     * Die Inhalte sind identisch, der Sprung ist deshalb nicht zu sehen – das ist
     * der ganze Trick am unendlichen Karussell.
     */
    const recenter = () => {
      // Während eines Ziehens würde der Sprung die gemerkte Startposition entwerten.
      if (drag.current.active) return;
      const copyWidth = slides.length * track.clientWidth;
      const shift =
        track.scrollLeft < copyWidth * 0.5
          ? copyWidth
          : track.scrollLeft > copyWidth * (LOOP_COPIES - 0.5)
            ? -copyWidth
            : 0;
      if (shift === 0) return;
      track.scrollLeft += shift;
      target += shift;
      originIndex += shift / track.clientWidth;
    };

    // quickTo hält einen einzigen Tween am Leben und lenkt ihn um, statt bei jedem
    // Rad-Ereignis einen neuen zu starten. Ein Neustart würde die Geschwindigkeit
    // jedes Mal auf null zurücksetzen – genau das ruckelt.
    const scrollTo = gsap.quickTo(track, "scrollLeft", {
      duration: SCROLL_DURATION,
      ease: "power3",
      onComplete: recenter,
    });

    // In der mittleren Kopie starten, damit nach beiden Seiten Vorrat da ist.
    track.scrollLeft = slides.length * track.clientWidth;
    target = track.scrollLeft;

    const onScroll = () => {
      // Mitten in einer Bewegung würde der Sprung sichtbar – erst danach umsetzen.
      if (wheeling || drag.current.active || gsap.isTweening(track)) return;
      recenter();
    };

    const settle = () => {
      wheeling = false;
      // Auf die Serie einrasten, in deren Richtung gescrollt wurde – nicht auf die
      // nächstgelegene. Sonst zöge es eine kurze Radbewegung dorthin zurück,
      // wo sie hergekommen ist, weil eine Serie eine ganze Bildschirmbreite misst.
      const moved = (track.scrollLeft - originIndex * track.clientWidth) / track.clientWidth;
      const steps =
        moved > 0 ? Math.ceil(moved - SETTLE_THRESHOLD) : Math.floor(moved + SETTLE_THRESHOLD);
      const index = Math.min(Math.max(originIndex + steps, 0), track.children.length - 1);

      target = index * track.clientWidth;
      scrollTo(target);

      // Snapping erst zurückholen, wenn der Tween das Raster erreicht hat, sonst
      // korrigiert der Browser die Position schlagartig.
      restoreSnapTimer = window.setTimeout(() => {
        track.style.scrollSnapType = "";
      }, SCROLL_DURATION * 1000);
    };

    const onWheel = (event: WheelEvent) => {
      // React hängt wheel-Listener passiv ein, dort bliebe preventDefault wirkungslos –
      // deshalb dieser native Listener mit { passive: false }.
      event.preventDefault();

      if (!wheeling) {
        wheeling = true;
        originIndex = Math.round(track.scrollLeft / track.clientWidth);
        target = track.scrollLeft;
        // Direkt am Element statt über React-State: ein State-Update wirkt erst im
        // nächsten Render, die ersten Tween-Frames liefen noch gegen das Snapping an.
        track.style.scrollSnapType = "none";
      }
      window.clearTimeout(restoreSnapTimer);

      const axis = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const raw = axis * (event.deltaMode === 1 ? LINE_HEIGHT_PX : 1);
      const delta = Math.min(Math.max(raw, -MAX_DELTA_PX), MAX_DELTA_PX);
      target = Math.min(Math.max(target + delta, 0), track.scrollWidth - track.clientWidth);
      scrollTo(target);

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, WHEEL_SETTLE_MS);
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("wheel", onWheel);
      track.removeEventListener("scroll", onScroll);
      window.clearTimeout(settleTimer);
      window.clearTimeout(restoreSnapTimer);
      gsap.killTweensOf(track);
    };
  }, [slides.length]);

  // Eigener Cursor: folgt der Maus weich nach, statt an ihr zu kleben.
  useEffect(() => {
    const cursor = cursorRef.current;
    const track = trackRef.current;
    if (!cursor || !track) return;

    const moveX = gsap.quickTo(cursor, "x", { duration: CURSOR_DURATION, ease: "power3" });
    const moveY = gsap.quickTo(cursor, "y", { duration: CURSOR_DURATION, ease: "power3" });

    const onPointerMove = (event: PointerEvent) => {
      // Touch-Geräte haben keinen Zeiger, dort bleibt der Cursor unsichtbar.
      if (event.pointerType !== "mouse") return;
      moveX(event.clientX + CURSOR_OFFSET_PX);
      moveY(event.clientY + CURSOR_OFFSET_PX);
      cursor.style.opacity = "1";
    };

    const onPointerLeave = () => {
      cursor.style.opacity = "0";
    };

    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerleave", onPointerLeave);
    return () => {
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerleave", onPointerLeave);
      gsap.killTweensOf(cursor);
    };
  }, []);

  // Nur die Maus wird von Hand gescrollt – Touch-Geräte können das nativ besser.
  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || event.pointerType !== "mouse") return;
    drag.current = {
      startX: event.clientX,
      startScrollLeft: track.scrollLeft,
      distance: 0,
      active: true,
    };
    setIsDragging(true);
    track.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    const deltaX = event.clientX - drag.current.startX;
    drag.current.distance = Math.max(drag.current.distance, Math.abs(deltaX));
    track.scrollLeft = drag.current.startScrollLeft - deltaX;
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    drag.current.active = false;
    setIsDragging(false);
    track.releasePointerCapture(event.pointerId);
  }

  function onClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (drag.current.distance > DRAG_THRESHOLD_PX) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    step(event.clientX - left < width / 2 ? -1 : 1);
  }

  if (slides.length === 0) {
    return (
      <div className="flex h-[calc(100svh-var(--header-height))] items-center justify-center text-sm italic">
        Noch keine Fotos – Bilder in public/photos/ legen und `npm run photos` laufen lassen.
      </div>
    );
  }

  // Dieselben Serien mehrfach hintereinander – zusammen mit dem Zurücksetzen der
  // Scroll-Position ergibt das eine Endlosschleife ohne Anfang und Ende.
  const loopedSlides = Array.from({ length: LOOP_COPIES }, () => slides).flat();

  return (
    <>
      {/* Eigener Zeiger statt des System-Cursors – nur hier, die Komponente steht nur auf der Startseite. */}
      <div
        ref={cursorRef}
        aria-hidden
        // mix-blend-difference invertiert den Text gegen den Untergrund: auf Weiss
        // erscheint er schwarz, auf einem dunklen Foto weiss. Sonst verschwände er darin.
        className="pointer-events-none fixed top-0 left-0 z-50 text-sm text-white mix-blend-difference opacity-0 will-change-transform"
      >
        scroll
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        className={`no-scrollbar flex h-[calc(100svh-var(--header-height))] cursor-none overflow-x-auto py-6 ${
          isDragging ? "snap-none select-none" : "snap-x snap-mandatory"
        }`}
      >
        {loopedSlides.map((slide, index) => (
          // Jede Serie bekommt eine volle Bildschirmbreite, damit nie zwei nebeneinander stehen.
          <div
            key={index}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center px-6"
          >
            <SlideRow
              slide={slide}
              maxHeight="calc(var(--slide-height) * 0.9)"
              maxWidth="90%"
              priority={index === slides.length}
            />
          </div>
        ))}
      </div>
    </>
  );
}

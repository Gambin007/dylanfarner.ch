export type Photo = {
  src: string;
  width: number;
  height: number;
  /** Beschreibung fürs alt-Attribut – immer gesetzt, notfalls aus dem Dateinamen. */
  alt: string;
  /** Bildunterschrift; null heisst: keine anzeigen. */
  title: string | null;
};

/** Bilder, die nebeneinander auf einer Seite stehen. Einzelbilder sind ein Slide mit einem Foto. */
export type Slide = Photo[];

export { slides } from "./photos.generated";

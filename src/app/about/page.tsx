import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dylan Farner — About",
};

const clients = [
  "WWF",
  "Remorrow",
  "Horgenglarus",
  "Züritipp",
  "Stadtchind",
  "Wagwan",
  "La Boca",
  "Palmnights",
  "LMN",
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl px-6 pt-50 pb-16 text-sm leading-relaxed sm:text-[15px]">
      <p>Dylan Farner</p>

      <p className="mt-6">
        Mail:{" "}
        <a className="underline" href="mailto:dylanfarner54@gmail.com">
          dylanfarner54@gmail.com
        </a>
        <br />
        Tel:{" "}
        <a className="underline" href="tel:+41786111210">
          +41 78 611 12 10
        </a>
      </p>

      <p className="mt-6">
        Dylan ist ein Fotograf aus Zürich, Schweiz. Er arbeitet in verschiedenen fotografischen
        Bereichen und beschäftigt sich mit Menschen, Mode, Partys, urbanen Räumen sowie Jugend- und
        Subkulturen. Sein vielseitiger und unmittelbarer Stil bewegt sich zwischen dokumentarischer
        Fotografie, Porträt und inszenierten Aufnahmen.
      </p>

      <p className="mt-4">
        Dylan lässt sich von seinem direkten Umfeld, sozialen Dynamiken und dem Nachtleben
        inspirieren. Seine Arbeiten entstehen aus der Nähe zu den Menschen und Situationen, die er
        fotografiert, und zeichnen sich durch eine authentische und persönliche Bildsprache aus.
      </p>

      <p className="mt-4">Dylan ist offen für Aufträge und fotografische Anfragen.</p>

      <h2 className="mt-10">→ Clients</h2>
      <p className="mt-1">{clients.join(", ")}</p>

      <h2 className="mt-10">→ Copyright</h2>
      <p className="mt-1">
        All images © {new Date().getFullYear()} by Dylan Farner. No use without permission.
      </p>

      <p className="mt-20 text-xs text-black/40">
        Built by{" "}
        <a
          className="underline"
          href="https://noeschertenleib.ch"
          target="_blank"
          rel="noreferrer"
        >
          noeschertenleib.ch
        </a>
      </p>
    </div>
  );
}

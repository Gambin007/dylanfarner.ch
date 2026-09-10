import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[var(--header-height)] items-center justify-between bg-white px-4 text-lg italic sm:px-6 sm:text-xl">
      <Link href="/about">About</Link>
      {/* Explizit zentriert statt über die statische Position: der Name ist deutlich
          grösser als die beiden Links und würde sonst nicht auf ihrer Mitte sitzen. */}
      <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-3xl">
        Dylan Farner
      </Link>
      <Link href="/gallery">Gallery</Link>
    </header>
  );
}

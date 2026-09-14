import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Figtree } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dylan Farner",
  description:
    "Dylan Farner – Fotograf aus Zürich.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={figtree.variable}>
      <body className="bg-white font-sans text-black antialiased">
        <Header />
        <main className="pt-[var(--header-height)]">{children}</main>
      </body>
    </html>
  );
}

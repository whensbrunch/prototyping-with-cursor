/**
 * Root layout: fonts (Orbitron + Barlow), metadata, and base HTML.
 * Aesthetic: Vaporwave / Synthwave.
 */

import type { Metadata } from "next";
import { orbitron, barlow } from "./fonts";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "David's prototypes",
  description: "The home for all my prototypes",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${barlow.variable}`}>
        {children}
      </body>
    </html>
  );
}

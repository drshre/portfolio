import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shreyas Parat, Design Engineer",
  description:
    "Design engineer in Los Angeles. Mechanical engineer turned product builder: GM patents, shipped iOS apps, and tools for Toyota, Fender and more.",
  openGraph: {
    title: "Shreyas Parat, Design Engineer",
    description: "Seven projects in a 3D meadow. Click one to see the answer.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // makes env(safe-area-inset-*) real, so the pills clear the home indicator
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Lilita+One&family=Pacifico&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

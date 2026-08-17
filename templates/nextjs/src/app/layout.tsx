import type { Metadata } from "next";
import "./globals.css";
import { DevAnnotationOverlay } from "./_components/annotate/DevAnnotationOverlay";

export const metadata: Metadata = {
  title: "Design Prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevAnnotationOverlay />
      </body>
    </html>
  );
}

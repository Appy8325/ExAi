import type { Metadata } from "next";
import type { ReactNode } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Concourse",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

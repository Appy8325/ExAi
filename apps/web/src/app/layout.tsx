import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { AuthSessionProvider } from "@/components/auth/session-provider";

export const metadata: Metadata = {
  title: "ExAi · AI-native trade show intelligence",
  description:
    "ExAi turns trade shows into living relationship intelligence. Exhibitors capture leads in seconds, attendees control their own profile data, and organizers see the full event in one place.",
  applicationName: "ExAi",
  authors: [{ name: "ExAi" }],
  keywords: [
    "trade show",
    "exhibitor",
    "attendee",
    "lead capture",
    "relationship intelligence",
    "AI",
    "event platform",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas font-sans text-primary antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthSessionProvider } from "@/components/auth/session-provider";
import { SkipLink } from "@/components/a11y/skip-link";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

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
    <html lang="en" className={inter.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: [
              "(function(){try{var d=document.documentElement;if(d.getAttribute('data-theme')!=='light'){d.setAttribute('data-theme','light');}}catch(e){}})();",
              "(function(){if(typeof window!=='undefined'&&'startViewTransition' in document){window.startViewTransition=function(cb){document.startViewTransition(cb);};}else{window.startViewTransition=function(cb){cb();};}})();",
            ].join("\n"),
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-primary antialiased">
        <AuthSessionProvider>
          <SkipLink />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}

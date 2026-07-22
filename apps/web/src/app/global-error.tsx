"use client";

import { Button } from "@concourse/ui";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const errorId = error.digest?.replaceAll(":", "-").slice(0, 8) ?? "unknown";

  console.error(`[GlobalError] id=${errorId}`, {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
  });

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "var(--mq-bg-base, #fafafa)",
            fontFamily: "var(--font-inter, system-ui, sans-serif)",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              width: "100%",
              backgroundColor: "var(--mq-bg-surface, #ffffff)",
              border: "1px solid var(--mq-border-default, #e5e7eb)",
              borderRadius: "0.75rem",
              padding: "2rem",
              boxShadow:
                "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "3rem",
                height: "3rem",
                borderRadius: "0.5rem",
                backgroundColor: "var(--mq-bg-danger-subtle, #fef2f2)",
                marginBottom: "1.25rem",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 10V6.667m0 6.666a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333zM10 15h.008M18.332 10a8.333 8.333 0 1 1-16.664 0 8.333 8.333 0 0 1 16.664 0z"
                  stroke="var(--mq-color-danger, #dc2626)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--mq-color-text-primary, #111827)",
                marginBottom: "0.5rem",
                lineHeight: 1.375,
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--mq-color-text-secondary, #6b7280)",
                lineHeight: 1.625,
                marginBottom: "1.5rem",
              }}
            >
              We encountered an unexpected error. Your session and data are
              safe. Please try again.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <Button
                onClick={reset}
                variant="primary"
                size="md"
                style={{ width: "100%" }}
              >
                Try again
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                variant="secondary"
                size="md"
                style={{ width: "100%" }}
              >
                Go to homepage
              </Button>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--mq-color-text-tertiary, #9ca3af)",
                marginTop: "1rem",
                textAlign: "center",
                fontFamily: "monospace",
              }}
            >
              Error {errorId}
              {process.env.NODE_ENV === "development" && error.message && (
                <span
                  style={{
                    display: "block",
                    marginTop: "0.5rem",
                    textAlign: "left",
                    fontSize: "0.7rem",
                    wordBreak: "break-all",
                    color: "var(--mq-color-text-tertiary, #9ca3af)",
                  }}
                >
                  {error.message}
                </span>
              )}
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
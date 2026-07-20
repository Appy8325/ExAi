"use client";

import { useState } from "react";

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else if (typeof document !== "undefined") {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.left = "-1000px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className={
        className ??
        "rounded-md border border-default bg-surface px-2 py-1 text-xs font-medium text-secondary hover:text-primary"
      }
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

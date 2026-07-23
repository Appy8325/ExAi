"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@concourse/ui";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: "navigation" | "exhibitor" | "event" | "action";
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const NAVIGATION_ITEMS: CommandItem[] = [
  {
    id: "home",
    label: "Home",
    description: "Go to homepage",
    category: "navigation",
    href: "/",
  },
  {
    id: "demo",
    label: "Experience ExAi",
    description: "Interactive product tour",
    category: "navigation",
    href: "/demo",
  },
  {
    id: "demo-organizer",
    label: "Organizer Workspace",
    description: "Demo: Event portfolio dashboard",
    category: "navigation",
    href: "/demo/organizer",
  },
  {
    id: "demo-exhibitor",
    label: "Exhibitor Workspace",
    description: "Demo: Booth operations",
    category: "navigation",
    href: "/demo/exhibitor",
  },
  {
    id: "attendee",
    label: "Attendee",
    description: "Live event floor",
    category: "navigation",
    href: "/hackathon",
  },
  {
    id: "admin",
    label: "Admin Panel",
    description: "Demo admin view",
    category: "navigation",
    href: "/demo/admin",
  },
  {
    id: "auth",
    label: "Sign In",
    description: "Sign in to your account",
    category: "navigation",
    href: "/auth",
  },
];

function CommandIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function CommandPalette({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const filteredItems = React.useMemo(() => {
    if (!query.trim()) return NAVIGATION_ITEMS;
    const lower = query.toLowerCase();
    return NAVIGATION_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower),
    );
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) {
        if (item.href) {
          router.push(item.href);
        } else if (item.onClick) {
          item.onClick();
        }
        setOpen(false);
        setQuery("");
      }
    }
  };

  const handleSelect = (item: CommandItem) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
    setOpen(false);
    setQuery("");
  };

  const grouped = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
    };
    for (const item of filteredItems) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category]!.push(item);
    }
    return groups;
  }, [filteredItems]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-default bg-surface px-3 py-1.5 text-body text-muted transition-colors hover:border-strong hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open page navigation"
      >
        <SearchIcon className="size-4" />
        <span className="hidden sm:inline">Go to...</span>
        <kbd className="hidden rounded border border-default bg-sunken px-1.5 py-0.5 text-caption font-medium text-muted sm:inline">
          Ctrl+K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0" aria-describedby={undefined}>
          <div className="flex items-center gap-3 border-b border-default px-4 py-3">
            <SearchIcon className="size-5 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Go to a page..."
              className="flex-1 bg-transparent text-body text-primary placeholder:text-muted outline-none"
            />
            <kbd className="rounded border border-default bg-sunken px-1.5 py-0.5 text-caption font-medium text-muted">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <p className="p-4 text-center text-body text-muted">No results found</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([category, items]) =>
                  items.length > 0 ? (
                    <div key={category}>
                      <p className="px-3 py-1.5 text-caption font-semibold uppercase tracking-wider text-muted">
                        {category === "navigation" ? "Navigation" : category}
                      </p>
                      <div role="listbox" aria-label={category}>
                        {items.map((item) => {
                          const globalIndex = filteredItems.indexOf(item);
                          const isSelected = globalIndex === selectedIndex;
                          return (
                            <button
                              key={item.id}
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelect(item)}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-body transition-colors ${
                                isSelected
                                  ? "bg-brand-subtle text-brand"
                                  : "text-primary hover:bg-sunken"
                              }`}
                            >
                              <CommandIcon className={isSelected ? "text-brand" : "text-muted"} />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium">{item.label}</p>
                                {item.description && (
                                  <p className="truncate text-caption text-muted">{item.description}</p>
                                )}
                              </div>
                              <svg
                                className={`size-4 shrink-0 transition-transform ${isSelected ? "translate-x-0.5 text-brand" : "text-muted"}`}
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden
                              >
                                <path d="M6 4l4 4-4 4" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-default px-4 py-2 text-caption text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-default bg-sunken px-1">↑</kbd>
                <kbd className="rounded border border-default bg-sunken px-1">↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-default bg-sunken px-1.5">↵</kbd>
                <span>to select</span>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </>
  );
}

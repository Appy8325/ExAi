"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@concourse/ui";

type ShowcaseExhibitorCard = {
  id: string;
  companyName: string;
  boothName: string;
  boothNumber: string | null;
  industry: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  website: string;
  contactEmail: string;
  contactPhone: string | null;
  socialLinks: Record<string, string>;
  products: string[];
  brochureUrl: string;
  publicQrToken: string | null;
  boothQrImage: string | null;
};

const industryColors: Record<string, string> = {
  "Robotics & Automation": "from-indigo-500 to-purple-600",
  "Artificial Intelligence": "from-violet-500 to-fuchsia-600",
  Biotechnology: "from-emerald-500 to-teal-600",
  "Defense & Aerospace": "from-amber-600 to-orange-600",
  "Clean Energy": "from-green-500 to-emerald-600",
  "Smart Infrastructure": "from-cyan-500 to-blue-600",
  "Logistics & Supply Chain": "from-sky-500 to-indigo-600",
  "Data & Analytics": "from-pink-500 to-rose-600",
  Cybersecurity: "from-red-600 to-rose-700",
  "Industrial Manufacturing": "from-slate-600 to-gray-700",
};

function getGradient(industry: string): string {
  return industryColors[industry] ?? "from-brand/60 to-brand/40";
}

export function ShowcaseClient({
  exhibitors,
}: {
  exhibitors: ShowcaseExhibitorCard[];
}) {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const industries = [...new Set(exhibitors.map((e) => e.industry))].sort();

  const filtered = exhibitors.filter((e) => {
    const matchSearch =
      !search ||
      e.companyName.toLowerCase().includes(search.toLowerCase()) ||
      e.industry.toLowerCase().includes(search.toLowerCase()) ||
      e.tagline.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !selectedIndustry || e.industry === selectedIndustry;
    return matchSearch && matchIndustry;
  });

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M10 10l4 4" />
          </svg>
          <input
            type="text"
            placeholder="Search exhibitors, industries, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-default bg-surface py-2.5 pl-10 pr-4 text-sm text-primary placeholder-muted outline-none transition-colors focus:border-brand"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {industries.map((ind) => (
            <button
              key={ind}
              type="button"
              onClick={() =>
                setSelectedIndustry(selectedIndustry === ind ? null : ind)
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                selectedIndustry === ind
                  ? "border-brand bg-brand text-on-brand"
                  : "border-default bg-surface text-secondary hover:border-brand/50 hover:text-brand"
              }`}
            >
              {ind}
            </button>
          ))}
          {selectedIndustry && (
            <button
              type="button"
              onClick={() => setSelectedIndustry(null)}
              className="rounded-full border border-default bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-sunken hover:text-primary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((exhibitor) => (
          <ExhibitorCard key={exhibitor.id} exhibitor={exhibitor} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-default p-12 text-center">
          <p className="text-sm text-secondary">
            No exhibitors match your search.
          </p>
        </div>
      )}
    </>
  );
}

function ExhibitorCard({
  exhibitor,
}: {
  exhibitor: ShowcaseExhibitorCard;
}) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const gradient = getGradient(exhibitor.industry);

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-default bg-surface shadow-1 transition-all hover:shadow-2">
        <div
          className={`h-24 bg-gradient-to-br ${gradient} p-5`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white shadow-sm backdrop-blur-sm">
            {exhibitor.companyName.charAt(0)}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-primary">
                {exhibitor.companyName}
              </h3>
              <p className="mt-0.5 text-sm text-muted">
                Booth {exhibitor.boothNumber ?? "\u2014"}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-default bg-sunken/60 px-2.5 py-1 text-[11px] font-medium text-secondary">
              {exhibitor.industry}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-secondary leading-relaxed">
            {exhibitor.tagline}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {exhibitor.publicQrToken ? (
              <Link
                href={`/visit/${exhibitor.publicQrToken}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-subtle px-3.5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand"
              >
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v10M3 8h10" />
                </svg>
                Open Booth
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setQrOpen(true)}
              disabled={!exhibitor.boothQrImage && !exhibitor.publicQrToken}
              className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-3.5 py-2 text-sm font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary disabled:opacity-40"
            >
              <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
              Show QR
            </button>

            {exhibitor.products.length > 0 ? (
              <button
                type="button"
                onClick={() => setProductsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-3.5 py-2 text-sm font-medium text-secondary transition-colors hover:bg-sunken hover:text-primary"
              >
                <svg className="size-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 4h12M2 8h12M2 12h12" />
                </svg>
                Products
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={productsOpen} onOpenChange={setProductsOpen}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold text-primary">
            {exhibitor.companyName} Products
          </DialogTitle>
          <ul className="mt-4 space-y-3">
            {exhibitor.products.map((product) => (
              <li
                key={product}
                className="rounded-xl border border-default bg-surface px-4 py-3 text-sm text-primary"
              >
                {product}
              </li>
            ))}
          </ul>
          <DialogClose asChild>
            <button
              type="button"
              className="mt-6 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-sunken"
            >
              Close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xs">
          <DialogTitle className="text-center text-lg font-semibold text-primary">
            {exhibitor.companyName}
          </DialogTitle>
          <p className="mt-1 text-center text-xs text-muted">
            Booth {exhibitor.boothNumber ?? "\u2014"}
          </p>
          <div className="mt-4 flex justify-center">
            {exhibitor.boothQrImage ? (
              <img
                src={exhibitor.boothQrImage}
                alt={`QR code for ${exhibitor.companyName}`}
                className="size-48 rounded-xl border border-default"
              />
            ) : (
              <div className="flex size-48 items-center justify-center rounded-xl border border-dashed border-default bg-surface text-xs text-muted">
                QR not available
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-muted">
            Scan to open the booth page
          </p>
          {exhibitor.publicQrToken ? (
            <p className="mt-2 truncate rounded-lg border border-default bg-surface px-3 py-2 text-center font-mono text-[11px] text-muted">
              /visit/{exhibitor.publicQrToken.slice(0, 16)}...
            </p>
          ) : null}
          <DialogClose asChild>
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-sunken"
            >
              Close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

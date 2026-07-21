/**
 * SkipLink — keyboard-only jump-to-content affordance.
 *
 * Visually hidden until focused. Press Tab on any page and the link slides
 * into view at the top-left, putting focus directly onto the main landmark.
 *
 * Pages opt-in by giving their primary container `id="main"` (or any of the
 * ids below). The link falls back to the first focusable element if no main
 * landmark is present.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-(--mq-z-tooltip) rounded-md bg-brand px-4 py-2 text-sm font-semibold text-on-brand shadow-2 transition-transform duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Skip to content
    </a>
  );
}

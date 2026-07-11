import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn `cn()` helper: composes conditional class names (clsx) and
 * then resolves conflicting Tailwind utility classes (tailwind-merge), so
 * later classes win over earlier ones (e.g. a consumer's `className` prop
 * overriding a component's default variant classes).
 *
 * Every vendored component in `src/components/` uses this for className
 * composition — see docs/39-design-system.md §15 and 40-ui-component-library.md.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

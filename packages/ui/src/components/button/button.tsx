import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

/**
 * Button — vendored shadcn-style component, demonstrating the pattern every
 * other component in docs/15-component-inventory.md follows: Radix primitive
 * (here, react-slot for `asChild` polymorphism) + class-variance-authority
 * variants + `cn()` composition.
 *
 * Governance (docs/39-design-system.md §15): every class below resolves to a
 * semantic token via theme.css's `@theme inline` mapping (e.g. `bg-brand` ->
 * `--color-bg-brand` -> `--mq-bg-brand`). No raw hex, no unmapped Tailwind
 * primitive (e.g. `bg-indigo-600`) is used here or should be used in any
 * future component.
 */
export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "text-body font-medium",
    "h-(--spacing-control-h) px-(--spacing-control-px)",
    "transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)]",
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-brand text-on-brand shadow-1",
          "hover:bg-brand-hover hover:shadow-2",
        ].join(" "),
        secondary: [
          "bg-surface text-primary border border-strong",
          "hover:bg-sunken hover:border-default",
        ].join(" "),
        ghost: [
          "bg-transparent text-primary",
          "hover:bg-sunken",
        ].join(" "),
        danger: [
          "bg-status-danger-solid text-on-brand shadow-1",
          "hover:opacity-90 hover:shadow-2",
        ].join(" "),
      },
      size: {
        sm: "text-body-sm",
        md: "text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (Radix Slot) instead of a native `<button>`. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

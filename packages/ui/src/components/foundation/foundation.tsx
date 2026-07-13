import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-md border border-default bg-surface p-(--spacing-card-p) shadow-1",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-(--spacing-control-h) w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) text-body text-primary outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-sm border border-strong bg-surface px-(--spacing-control-px) py-2 text-body text-primary outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full text-left text-body text-primary", className)}
      {...props}
    />
  ),
);
Table.displayName = "Table";

export type TimelineProps = React.OlHTMLAttributes<HTMLOListElement>;

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn("space-y-(--spacing-gap-stack)", className)} {...props} />
  ),
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  timestamp?: React.ReactNode;
}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, timestamp, children, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("border-l-2 border-default pl-4 text-body text-primary", className)}
      {...props}
    >
      {timestamp ? <p className="mb-1 text-caption text-muted">{timestamp}</p> : null}
      {children}
    </li>
  ),
);
TimelineItem.displayName = "TimelineItem";

export interface MetricCardProps extends Omit<CardProps, "title"> {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}

export function MetricCard({ label, value, detail, className, ...props }: MetricCardProps) {
  return (
    <Card className={cn("space-y-1", className)} {...props}>
      <p className="text-caption font-medium text-secondary">{label}</p>
      <p className="text-title font-semibold tabular-nums text-primary">{value}</p>
      {detail ? <p className="text-body-sm text-muted">{detail}</p> : null}
    </Card>
  );
}

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-caption font-medium",
  {
    variants: {
      tone: {
        neutral: "border-default bg-sunken text-secondary",
        success: "border-status-success-border bg-status-success-subtle text-status-success-text",
        warning: "border-status-warning-border bg-status-warning-subtle text-status-warning-text",
        danger: "border-status-danger-border bg-status-danger-subtle text-status-danger-text",
        info: "border-status-info-border bg-status-info-subtle text-status-info-text",
        ai: "border-status-ai-border bg-status-ai-subtle text-status-ai-text",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

export function StatusBadge({ className, tone, ...props }: StatusBadgeProps) {
  return <span className={cn(statusBadgeVariants({ tone }), className)} {...props} />;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed border-default p-6 text-center",
        className,
      )}
      {...props}
    >
      <h2 className="text-title-sm font-semibold text-primary">{title}</h2>
      {description ? <p className="mt-1 max-w-md text-body text-secondary">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-sm bg-sunken", className)}
      {...props}
    />
  );
}

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
>;

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--mq-z-overlay) bg-overlay" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 z-(--mq-z-modal) w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-default bg-raised p-6 shadow-3",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  ),
);
DialogContent.displayName = "DialogContent";

const toastVariants = cva("rounded-md border p-4 shadow-4", {
  variants: {
    tone: {
      neutral: "border-default bg-raised text-primary",
      success: "border-status-success-border bg-status-success-subtle text-status-success-text",
      warning: "border-status-warning-border bg-status-warning-subtle text-status-warning-text",
      danger: "border-status-danger-border bg-status-danger-subtle text-status-danger-text",
      info: "border-status-info-border bg-status-info-subtle text-status-info-text",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants>;

/** A presentational live region. Apps own dismissal state and queueing. */
export function Toast({ className, tone, ...props }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(toastVariants({ tone }), className)}
      {...props}
    />
  );
}

export type NavigationProps = React.HTMLAttributes<HTMLElement>;

export function DesktopNavigation({ className, ...props }: NavigationProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn("hidden items-center gap-2 md:flex", className)}
      {...props}
    />
  );
}

export function MobileNavigation({ className, ...props }: NavigationProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className={cn("flex items-center justify-around gap-1 md:hidden", className)}
      {...props}
    />
  );
}

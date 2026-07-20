import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

const cardVariants = cva(
  "rounded-lg border bg-surface shadow-1 transition-all duration-[var(--mq-duration-moderate)] ease-[var(--mq-ease-standard)]",
  {
    variants: {
      variant: {
        default: "border-default",
        elevated:
          "border-transparent shadow-2 hover:shadow-card-hover",
        outline: "border-default bg-transparent shadow-none",
        interactive:
          "border-default cursor-pointer hover:border-strong hover:shadow-card-hover",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), "p-(--spacing-card-p)", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

/* -------------------------------------------------------------------------- */
/* PremiumCard                                                                */
/* -------------------------------------------------------------------------- */

export interface PremiumCardProps extends CardProps {
  /** Optional icon/avatar slot at top-left */
  icon?: React.ReactNode;
  /** Optional action slot at top-right */
  action?: React.ReactNode;
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = "default", icon, action, children, ...props }, ref) => (
    <Card ref={ref} variant={variant} className={cn("space-y-4", className)} {...props}>
      {icon || action ? (
        <div className="flex items-start justify-between gap-4">
          {icon ? <div className="shrink-0">{icon}</div> : null}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </Card>
  ),
);
PremiumCard.displayName = "PremiumCard";

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** If true, renders with error styling */
  error?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-(--spacing-control-h) w-full rounded-md border bg-surface px-(--spacing-control-px) text-body text-primary outline-none placeholder:text-muted transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)]",
        "focus:border-strong focus:ring-2 focus:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-status-danger-border focus:border-status-danger-text focus:ring-status-danger-text/20"
          : "border-strong",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/* -------------------------------------------------------------------------- */
/* Textarea                                                                   */
/* -------------------------------------------------------------------------- */

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-md border bg-surface px-(--spacing-control-px) py-2 text-body text-primary outline-none placeholder:text-muted transition-all duration-[var(--mq-duration-fast)] ease-[var(--mq-ease-standard)]",
        "focus:border-strong focus:ring-2 focus:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-status-danger-border focus:border-status-danger-text focus:ring-status-danger-text/20"
          : "border-strong",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

/* -------------------------------------------------------------------------- */
/* Field wrapper                                                              */
/* -------------------------------------------------------------------------- */

export interface FieldProps {
  label: string;
  /** Optional helper text displayed below the field */
  helper?: React.ReactNode;
  /** Error message – when set, the field renders in error state */
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, helper, error, children, className }: FieldProps) {
  const id = React.useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-body-sm font-medium text-primary">
        {label}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string; error?: boolean }>, {
            id,
            error: Boolean(error),
          })
        : children}
      {helper && !error ? (
        <p className="text-caption text-muted">{helper}</p>
      ) : null}
      {error ? (
        <p className="text-caption text-status-danger-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Table                                                                      */
/* -------------------------------------------------------------------------- */

export type TableProps = React.TableHTMLAttributes<HTMLTableElement>;

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-lg border border-default">
      <table
        ref={ref}
        className={cn("w-full text-left text-body text-primary", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-sunken/50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-default transition-colors duration-[var(--mq-duration-fast)] last:border-b-0",
      "hover:bg-sunken/30",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-(--spacing-table-row-h) px-(--spacing-table-cell-px) text-left text-caption font-semibold text-secondary uppercase tracking-wider",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "h-(--spacing-table-row-h) px-(--spacing-table-cell-px) text-body text-primary",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("divide-y divide-default", className)} {...props} />
));
TableBody.displayName = "TableBody";

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* KPI / Metric Card                                                          */
/* -------------------------------------------------------------------------- */

export interface MetricCardProps extends Omit<CardProps, "title"> {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  trend?: { value: string; positive: boolean };
}

export function MetricCard({ label, value, detail, trend, className, ...props }: MetricCardProps) {
  return (
    <Card variant="default" className={cn("space-y-1.5", className)} {...props}>
      <p className="text-caption font-medium text-secondary">{label}</p>
      <p className="text-title-lg font-semibold tabular-nums text-primary transition-all duration-[var(--mq-duration-moderate)]">
        {value}
      </p>
      {trend ? (
        <p
          className={cn(
            "inline-flex items-center gap-1 text-body-sm font-medium",
            trend.positive ? "text-status-success-text" : "text-status-danger-text",
          )}
        >
          <TrendArrow up={trend.positive} />
          {trend.value}
        </p>
      ) : null}
      {detail ? <p className="text-body-sm text-muted">{detail}</p> : null}
    </Card>
  );
}

function TrendArrow({ up }: { up: boolean }) {
  return (
    <svg
      className="size-3"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {up ? (
        <path d="M6 9.5V2.5M2.5 6L6 2.5 9.5 6" />
      ) : (
        <path d="M6 2.5v7M2.5 6L6 9.5 9.5 6" />
      )}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* KPICard — premium with animated background and icon                        */
/* -------------------------------------------------------------------------- */

export interface KPICardProps {
  label: string;
  value: string;
  detail?: string;
  trend?: { value: string; positive: boolean };
  icon?: React.ReactNode;
  accent?: "brand" | "success" | "warning" | "danger" | "info" | "ai";
}

const accentMap: Record<string, string> = {
  brand: "from-brand/5 to-brand/[0.02] border-brand/10",
  success: "from-status-success-subtle/50 to-status-success-subtle/10 border-status-success-border/30",
  warning: "from-status-warning-subtle/50 to-status-warning-subtle/10 border-status-warning-border/30",
  danger: "from-status-danger-subtle/50 to-status-danger-subtle/10 border-status-danger-border/30",
  info: "from-status-info-subtle/50 to-status-info-subtle/10 border-status-info-border/30",
  ai: "from-status-ai-subtle/50 to-status-ai-subtle/10 border-status-ai-border/30",
};

const iconAccentMap: Record<string, string> = {
  brand: "bg-brand/10 text-brand",
  success: "bg-status-success-subtle text-status-success-text",
  warning: "bg-status-warning-subtle text-status-warning-text",
  danger: "bg-status-danger-subtle text-status-danger-text",
  info: "bg-status-info-subtle text-status-info-text",
  ai: "bg-status-ai-subtle text-status-ai-text",
};

export function KPICard({ label, value, detail, trend, icon, accent = "brand" }: KPICardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 shadow-1 transition-all duration-[var(--mq-duration-moderate)] ease-[var(--mq-ease-standard)] hover:shadow-card-hover",
        accentMap[accent],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-caption font-medium text-secondary">{label}</p>
          <p className="text-title-lg font-semibold tabular-nums text-primary">{value}</p>
          {trend ? (
            <p
              className={cn(
                "inline-flex items-center gap-1 text-body-sm font-medium",
                trend.positive ? "text-status-success-text" : "text-status-danger-text",
              )}
            >
              <TrendArrow up={trend.positive} />
              {trend.value}
            </p>
          ) : null}
          {detail ? <p className="text-body-sm text-muted">{detail}</p> : null}
        </div>
        {icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              iconAccentMap[accent],
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* StatusBadge                                                                */
/* -------------------------------------------------------------------------- */

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-caption font-medium transition-colors duration-[var(--mq-duration-fast)]",
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
      size: {
        sm: "px-2 py-0 text-caption",
        md: "px-2.5 py-0.5 text-caption",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

export function StatusBadge({ className, tone, size, ...props }: StatusBadgeProps) {
  const dot = tone && tone !== "neutral";
  return (
    <span className={cn(statusBadgeVariants({ tone, size }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden="true"
          className={cn("size-1.5 rounded-full", {
            "bg-status-success-text": tone === "success",
            "bg-status-warning-text": tone === "warning",
            "bg-status-danger-text": tone === "danger",
            "bg-status-info-text": tone === "info",
            "bg-status-ai-text": tone === "ai",
          })}
        />
      ) : null}
      {props.children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Badge (plain, non-status)                                                  */
/* -------------------------------------------------------------------------- */

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-caption font-medium",
  {
    variants: {
      variant: {
        default: "bg-sunken text-secondary",
        brand: "bg-brand/10 text-brand",
        success: "bg-status-success-subtle text-status-success-text",
        warning: "bg-status-warning-subtle text-status-warning-text",
        danger: "bg-status-danger-subtle text-status-danger-text",
        info: "bg-status-info-subtle text-status-info-text",
        ai: "bg-status-ai-subtle text-status-ai-text",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/* -------------------------------------------------------------------------- */
/* EmptyState                                                                 */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-default p-8 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-sunken text-muted">
          {icon}
        </div>
      ) : null}
      <h2 className="text-title-sm font-semibold text-primary">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-sm text-body text-secondary">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Renders a text-like skeleton line */
  text?: boolean;
};

export function Skeleton({ className, text, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-sunken",
        text ? "h-4 w-full" : "",
        className,
      )}
      style={
        text ? { animation: "mq-skeleton-pulse 1.5s ease-in-out infinite" } : undefined
      }
      {...props}
    />
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-lg border border-default bg-surface p-(--spacing-card-p) shadow-1 space-y-3",
        className,
      )}
      {...props}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className="flex gap-4 px-(--spacing-table-cell-px)">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-default px-(--spacing-table-cell-px) py-3"
        >
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dialog / Modal                                                             */
/* -------------------------------------------------------------------------- */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
>;

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--mq-z-overlay) bg-overlay data-[state=open]:animate-[mq-fade-in_150ms_ease-out]" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 z-(--mq-z-modal) w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-default bg-raised p-6 shadow-4",
          "data-[state=open]:animate-[mq-scale-in_200ms_cubic-bezier(0.16,1,0.3,1)]",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
DialogContent.displayName = "DialogContent";

/* -------------------------------------------------------------------------- */
/* Drawer                                                                     */
/* -------------------------------------------------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn(
        "fixed inset-y-0 right-0 z-(--mq-z-modal) flex w-full max-w-lg flex-col border-l border-default bg-raised shadow-4 transition-transform duration-[var(--mq-duration-slow)] ease-[var(--mq-ease-enter)]",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      {title ? (
        <div className="flex items-center justify-between border-b border-default px-6 py-4">
          <h2 className="text-title font-semibold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-sunken hover:text-primary transition-colors"
            aria-label="Close drawer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Toast                                                                      */
/* -------------------------------------------------------------------------- */

const toastVariants = cva(
  "rounded-lg border p-4 shadow-4 transition-all duration-[var(--mq-duration-moderate)] ease-[var(--mq-ease-standard)]",
  {
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
  },
);

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants>;

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

/* -------------------------------------------------------------------------- */
/* PageHeader                                                                 */
/* -------------------------------------------------------------------------- */

export interface PageHeaderProps {
  /** Breadcrumb-style parent label (e.g. "Events") */
  parent?: { label: string; href?: string };
  title: string;
  description?: string;
  /** Slot for primary actions (buttons, links) */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ parent, title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("space-y-1", className)}>
      {parent ? (
        <p className="text-caption font-medium text-muted">
          {parent.href ? (
            <a
              href={parent.href}
              className="hover:text-primary transition-colors"
            >
              {parent.label}
            </a>
          ) : (
            parent.label
          )}
        </p>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-title-lg font-semibold text-primary">{title}</h1>
          {description ? (
            <p className="mt-1 text-body text-secondary">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionHeader                                                              */
/* -------------------------------------------------------------------------- */

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0 flex-1">
        <h2 className="text-title font-semibold text-primary">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-body-sm text-secondary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Breadcrumbs                                                                */
/* -------------------------------------------------------------------------- */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-caption text-muted", className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {i > 0 ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M4.5 2.5l3.5 3.5-3.5 3.5" />
              </svg>
            ) : null}
            {isLast || !item.href ? (
              <span
                className={cn(
                  "truncate max-w-[12rem]",
                  isLast ? "text-primary font-medium" : "",
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="truncate max-w-[12rem] hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation helpers                                                        */
/* -------------------------------------------------------------------------- */

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

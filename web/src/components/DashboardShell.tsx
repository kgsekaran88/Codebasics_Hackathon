import type { CSSProperties, ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

/** Grows charts to fill viewport below header / insights. */
export function ChartViewport({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-1 flex-col min-h-0 w-full min-h-[calc(100dvh-11.5rem)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

/** Dashboard page shell — fills main column; chart area uses ChartViewport. */
export default function DashboardShell({ title, subtitle, toolbar, children }: Props) {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 h-full w-full pb-4">
      <header className="shrink-0 flex flex-col sm:flex-row sm:flex-wrap sm:items-end justify-between gap-3 pb-3 border-b border-[var(--color-border)]/60">
        <div className="min-w-0">
          <h1
            data-testid="page-title"
            className="font-display text-xl sm:text-2xl lg:text-3xl text-white leading-tight"
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--color-muted)] mt-0.5 max-w-3xl">{subtitle}</p>
          )}
        </div>
        {toolbar && <div className="shrink-0 w-full sm:w-auto">{toolbar}</div>}
      </header>
      <div className="flex flex-col flex-1 min-h-0 gap-3">{children}</div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className = "",
  style,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={`panel flex flex-col min-w-0 h-full ${className}`} style={style}>
      {(title || subtitle) && (
        <header className="shrink-0 px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]/40">
          {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
          {subtitle && (
            <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-snug">{subtitle}</p>
          )}
        </header>
      )}
      <div className="flex-1 min-h-0 px-3 py-2 pb-3 pr-4 overflow-visible">{children}</div>
    </section>
  );
}

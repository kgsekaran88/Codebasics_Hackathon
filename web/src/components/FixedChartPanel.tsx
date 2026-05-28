import type { ReactNode } from "react";
import ChartTakeaway from "./ChartTakeaway";

/**
 * Chart panel with a guaranteed pixel height so ECharts always has room to render.
 * Use on pages where flex `height="fill"` collapses charts into unreadable slivers.
 */
export default function FixedChartPanel({
  title,
  subtitle,
  heightPx,
  toolbar,
  takeaway,
  children,
  testId,
}: {
  title: string;
  subtitle?: string;
  heightPx: number;
  toolbar?: ReactNode;
  takeaway?: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section
      className="panel flex flex-col min-w-0 overflow-hidden"
      style={{ height: heightPx }}
      data-testid={testId}
    >
      <header className="shrink-0 px-3 pt-2.5 pb-1.5 border-b border-[var(--color-border)]/40">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {subtitle && (
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-snug">{subtitle}</p>
            )}
          </div>
          {toolbar && <div className="shrink-0">{toolbar}</div>}
        </div>
      </header>
      <div className="flex-1 min-h-0 px-3 py-2 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0">{children}</div>
        {takeaway && <ChartTakeaway text={takeaway} />}
      </div>
    </section>
  );
}

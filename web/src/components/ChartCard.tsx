import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, className = "" }: Props) {
  return (
    <section className={`panel panel-glow p-5 ${className}`}>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-[var(--color-muted)] mt-0.5 max-w-2xl">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
}

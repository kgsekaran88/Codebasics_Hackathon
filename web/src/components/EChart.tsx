import { forwardRef, useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts/core";

interface Props {
  option: EChartsOption;
  /** Fixed px height, or "fill" to size from parent (parent needs min-height or fixed height). */
  height?: number | "fill";
  className?: string;
  onEvents?: Record<string, (params: unknown) => void>;
}

const EChart = forwardRef<ReactECharts, Props>(function EChart(
  { option, height = "fill", className, onEvents },
  forwardedRef
) {
  const chartRef = useRef<ReactECharts>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w >= 48 && h >= 48) {
        setDims((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
      }
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const inst = chartRef.current?.getEchartsInstance() as EChartsType | undefined;
    inst?.resize();
  }, [dims.w, dims.h, option]);

  const chartHeight = typeof height === "number" ? height : dims.h;
  const chartWidth = dims.w;
  const ready = chartHeight >= 48 && chartWidth >= 48;

  const containerClass =
    height === "fill"
      ? `w-full min-w-0 flex-1 min-h-0 h-full box-border ${className ?? ""}`
      : `w-full box-border ${className ?? ""}`;

  return (
    <div ref={containerRef} className={containerClass}>
      {ready && (
        <ReactECharts
          ref={(inst) => {
            chartRef.current = inst;
            if (typeof forwardedRef === "function") forwardedRef(inst);
            else if (forwardedRef) forwardedRef.current = inst;
          }}
          option={option}
          style={{ width: chartWidth, height: chartHeight }}
          opts={{ renderer: "canvas" }}
          notMerge
          onEvents={onEvents}
        />
      )}
    </div>
  );
});

export default EChart;

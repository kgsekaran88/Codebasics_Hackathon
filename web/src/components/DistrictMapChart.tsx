import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import type { EChartsType } from "echarts/core";
import EChart from "./EChart";
import { districtMapOption, type DistrictMapMode } from "../charts/options";

const MAP_NAME = "TN_DISTRICTS";
let mapRegistered = false;

type GeoFeature = {
  properties: {
    name: string;
    label?: string;
    winner_party_norm_2026: string;
    ac_count: number;
    flips: number;
    flip_pct: number;
    data_districts?: string;
  };
};

type GeoCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

export default function DistrictMapChart({ mode }: { mode: DistrictMapMode }) {
  const chartRef = useRef<ReactECharts>(null);
  const [geo, setGeo] = useState<GeoCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!geo) return;
    const id = requestAnimationFrame(() => {
      (chartRef.current?.getEchartsInstance() as EChartsType | undefined)?.resize();
    });
    return () => cancelAnimationFrame(id);
  }, [geo, mode]);

  useEffect(() => {
    let cancelled = false;
    fetch("/geo/tn_districts_map.geojson")
      .then((r) => {
        if (!r.ok) throw new Error(`Map load failed (${r.status})`);
        return r.json();
      })
      .then((g: GeoCollection) => {
        if (cancelled) return;
        if (!mapRegistered) {
          // GeoJSON from public asset; ECharts types expect compressed geometry
          echarts.registerMap(MAP_NAME, g as never);
          mapRegistered = true;
        }
        setGeo(g);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Map unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-[var(--color-muted)]">{error}</p>;
  }
  if (!geo) {
    return <p className="text-sm text-[var(--color-muted)]">Loading map…</p>;
  }

  return (
    <EChart
      ref={chartRef}
      option={districtMapOption(geo.features, mode)}
      height="fill"
      className="h-full w-full"
    />
  );
}

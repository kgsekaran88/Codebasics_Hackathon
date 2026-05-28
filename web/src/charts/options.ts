import type { EChartsOption } from "echarts";
import { partyColor, REGION_COLORS, REGION_ORDER, REGION_SHORT } from "../lib/colors";
import { grid as chartGrid, sankeyBox } from "./chartLayout";

const axisStyle = {
  axisLine: { lineStyle: { color: "#2a3548" } },
  axisLabel: { color: "#8b9bb4", fontSize: 11 },
  splitLine: { lineStyle: { color: "#1a2230" } },
};

const tooltipBase = {
  backgroundColor: "#141a24",
  borderColor: "#2a3548",
  textStyle: { color: "#e8edf5", fontSize: 11 },
  confine: true,
};

export function seatTallyOption(
  rows: { party: string; seats: number }[],
  title: string
): EChartsOption {
  const sorted = [...rows].sort((a, b) => b.seats - a.seats).slice(0, 12);
  return {
    backgroundColor: "transparent",
    title: { text: title, left: 0, textStyle: { color: "#8b9bb4", fontSize: 12 } },
    grid: { ...chartGrid.barHorizontal, left: 12, top: 36, right: 40 },
    xAxis: { type: "value", ...axisStyle },
    yAxis: {
      type: "category",
      data: sorted.map((r) => r.party).reverse(),
      ...axisStyle,
    },
    series: [
      {
        type: "bar",
        data: sorted
          .map((r) => ({
            value: r.seats,
            itemStyle: { color: partyColor(r.party), borderRadius: [0, 4, 4, 0] },
          }))
          .reverse(),
        label: { show: true, position: "right", color: "#e8edf5", fontSize: 11 },
      },
    ],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
  };
}

/** Horizontal bar — better than pie for comparing many party shares (RSS / 538). */
export function voteShareBarOption(
  rows: { party: string; vote_share_pct: number }[],
  title: string
): EChartsOption {
  const top = [...rows].sort((a, b) => b.vote_share_pct - a.vote_share_pct).slice(0, 8);
  return {
    backgroundColor: "transparent",
    title: { text: title, left: 0, textStyle: { color: "#8b9bb4", fontSize: 11 } },
    grid: { ...chartGrid.barHorizontalLabeled, top: 28, bottom: 16 },
    xAxis: {
      type: "value",
      max: 45,
      ...axisStyle,
      axisLabel: { ...axisStyle.axisLabel, formatter: "{value}%" },
    },
    yAxis: {
      type: "category",
      data: top.map((r) => r.party).reverse(),
      ...axisStyle,
    },
    series: [
      {
        type: "bar",
        data: top
          .map((r) => ({
            value: Math.round(r.vote_share_pct * 10) / 10,
            itemStyle: { color: partyColor(r.party), borderRadius: [0, 3, 3, 0] },
          }))
          .reverse(),
        label: { show: true, position: "right", formatter: "{c}%", color: "#e8edf5", fontSize: 10 },
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: (p: unknown) => {
        const params = Array.isArray(p) ? p[0] : p;
        const d = params as { name: string; value: number };
        return `${d.name}: ${d.value}% vote share`;
      },
      backgroundColor: "#141a24",
      borderColor: "#2a3548",
    },
  };
}

/** Dumbbell-style margin shift for two years (Q6). */
export function marginDumbbellOption(
  rows: { ac_name: string; margin_pct_2021: number; margin_pct_2026: number }[],
  limit = 15
): EChartsOption {
  const sorted = [...rows]
    .sort((a, b) => a.margin_pct_2026 - b.margin_pct_2026)
    .slice(0, limit);
  const names = sorted.map((r) => r.ac_name).reverse();
  return {
    backgroundColor: "transparent",
    grid: { ...chartGrid.barHorizontal, left: 100, top: 8, bottom: 16 },
    xAxis: { type: "value", name: "Margin %", ...axisStyle },
    yAxis: { type: "category", data: names, ...axisStyle },
    tooltip: { trigger: "axis", backgroundColor: "#141a24", borderColor: "#2a3548" },
    series: [
      {
        name: "2021",
        type: "scatter",
        symbolSize: 6,
        data: sorted.map((r, i) => [r.margin_pct_2021, names.length - 1 - i]).reverse(),
        itemStyle: { color: "#8b9bb4" },
      },
      {
        name: "2026",
        type: "scatter",
        symbolSize: 6,
        data: sorted.map((r, i) => [r.margin_pct_2026, names.length - 1 - i]).reverse(),
        itemStyle: { color: "#e8b84a" },
      },
    ],
    legend: { top: 0, right: 0, textStyle: { color: "#8b9bb4", fontSize: 10 } },
  };
}

/** Strip year suffixes from Sankey node labels for party color lookup. */
function sankeyPartyLabel(name: string): string {
  return name.replace(" (2021)", "").replace(" (2026)", "");
}

export function sankeyOption(
  edges: { source: string; target: string; value: number }[],
  _compact = false
): EChartsOption {
  // ECharts requires distinct node ids per column; shared party names (e.g. DMK→DMK)
  // otherwise form cycles and the layout renders blank.
  const links = edges.map((e) => ({
    source: `${e.source} (2021)`,
    target: `${e.target} (2026)`,
    value: e.value,
  }));
  const nodes = new Set<string>();
  links.forEach((e) => {
    nodes.add(e.source);
    nodes.add(e.target);
  });
  const nodeList = [...nodes];
  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      formatter: (raw) => {
        const p = raw as { name?: string; data?: { source?: string; target?: string; value?: number } };
        if (p.data?.source && p.data?.target) {
          return `${p.data.source} → ${p.data.target}<br/>${p.data.value} seats`;
        }
        return p.name ?? "";
      },
    },
    series: [
      {
        type: "sankey",
        emphasis: { focus: "adjacency" },
        orient: "horizontal",
        nodeAlign: "justify",
        ...sankeyBox,
        nodeWidth: 20,
        nodeGap: 12,
        data: nodeList.map((name) => ({
          name,
          itemStyle: { color: partyColor(sankeyPartyLabel(name)) },
        })),
        links,
        lineStyle: { color: "gradient", curveness: 0.45, opacity: 0.4 },
        label: {
          color: "#e8edf5",
          fontSize: 11,
          formatter: (params: { name: string }) => sankeyPartyLabel(params.name),
        },
        layoutIterations: 48,
      },
    ],
  };
}

type MarginRow = {
  margin_pct_2021: number;
  margin_pct_2026: number;
  region: string;
  ac_number?: number;
  ac_name?: string;
};

export function marginBeeswarmOption(rows: MarginRow[]): EChartsOption {
  const byRegion: Record<string, MarginRow[]> = {};
  rows.forEach((r) => {
    if (!byRegion[r.region]) byRegion[r.region] = [];
    byRegion[r.region].push(r);
  });
  const regions = Object.keys(byRegion);
  return {
    backgroundColor: "transparent",
    grid: chartGrid.scatter,
    dataZoom: [{ type: "inside", xAxisIndex: 0 }, { type: "inside", yAxisIndex: 0 }],
    xAxis: {
      type: "value",
      name: "2021 margin %",
      nameLocation: "middle",
      nameGap: 30,
      ...axisStyle,
    },
    yAxis: {
      type: "value",
      name: "2026 margin %",
      nameLocation: "middle",
      nameGap: 36,
      min: 0,
      ...axisStyle,
    },
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      formatter: (raw) => {
        const p = raw as { data?: MarginRow & { value?: [number, number] }; seriesName?: string };
        const d = p.data;
        if (!d) return "";
        const title = d.ac_name ? `${d.ac_number}. ${d.ac_name}` : p.seriesName ?? "";
        return `${title}<br/>2021 margin: ${d.margin_pct_2021?.toFixed(1)}%<br/>2026 margin: ${d.margin_pct_2026?.toFixed(1)}%`;
      },
    },
    series: regions.map((region) => ({
      name: REGION_SHORT[region] ?? region,
      type: "scatter",
      symbolSize: 8,
      data: byRegion[region].map((r) => ({
        value: [r.margin_pct_2021, r.margin_pct_2026],
        margin_pct_2021: r.margin_pct_2021,
        margin_pct_2026: r.margin_pct_2026,
        ac_number: r.ac_number,
        ac_name: r.ac_name,
        region: r.region,
      })),
      itemStyle: { color: REGION_COLORS[region] ?? "#78909C", opacity: 0.75 },
    })),
    legend: {
      bottom: 0,
      textStyle: { color: "#8b9bb4", fontSize: 10 },
      type: "scroll",
      selectedMode: true,
    },
  };
}

export type DistrictMapMode = "party" | "flip";

export type DistrictMapFeatureProps = {
  name: string;
  label?: string;
  winner_party_norm_2026: string;
  ac_count: number;
  flips: number;
  flip_pct: number;
  data_districts?: string;
};

export function districtMapOption(
  features: { properties: DistrictMapFeatureProps }[],
  mode: DistrictMapMode
): EChartsOption {
  const data = features.map((f) => {
    const p = f.properties;
    const display = p.label ?? p.name;
    const base = {
      name: p.name,
      value: mode === "party" ? p.ac_count : p.flip_pct,
      display,
      winner_party_norm_2026: p.winner_party_norm_2026,
      ac_count: p.ac_count,
      flips: p.flips,
      flip_pct: p.flip_pct,
      data_districts: p.data_districts,
    };
    if (mode === "party") {
      return {
        ...base,
        itemStyle: {
          areaColor: partyColor(p.winner_party_norm_2026),
          borderColor: "#1a2230",
          borderWidth: 0.6,
        },
      };
    }
    return base;
  });

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      formatter: (raw) => {
        const p = raw as { data?: DistrictMapFeatureProps & { display?: string } };
        const d = p.data;
        if (!d) return "";
        const title = d.display ?? d.name;
        if (mode === "party") {
          return `${title}<br/>2026 lead: ${d.winner_party_norm_2026} (${d.ac_count} ACs in district)`;
        }
        return `${title}<br/>Flip rate: ${d.flip_pct}% (${d.flips}/${d.ac_count} ACs)`;
      },
    },
    visualMap:
      mode === "flip"
        ? {
            show: true,
            min: 0,
            max: 80,
            text: ["High", "Low"],
            orient: "vertical",
            right: 16,
            top: "center",
            itemHeight: 72,
            inRange: { color: ["#1a2230", "#e8b84a"] },
            textStyle: { color: "#8b9bb4", fontSize: 10 },
          }
        : undefined,
    series: [
      {
        type: "map",
        map: "TN_DISTRICTS",
        roam: true,
        layoutCenter: ["50%", "50%"],
        layoutSize: "98%",
        aspectScale: 0.78,
        scaleLimit: { min: 0.9, max: 5 },
        emphasis: {
          label: { show: true, color: "#e8edf5", fontSize: 10 },
          itemStyle: { areaColor: undefined, borderColor: "#e8b84a", borderWidth: 1.2 },
        },
        label: { show: false },
        data,
      },
    ],
  };
}

/** Horizontal stacked bars — readable for 6 macro-regions on dashboard panels. */
export function regionalStackOption(
  data: { region: string; party: string; seats: number }[]
): EChartsOption {
  const regions = REGION_ORDER.filter((r) => data.some((d) => d.region === r));
  const partyTotals = new Map<string, number>();
  data.forEach((d) => partyTotals.set(d.party, (partyTotals.get(d.party) ?? 0) + d.seats));
  const parties = [...partyTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p)
    .slice(0, 7);

  return {
    backgroundColor: "transparent",
    grid: { ...chartGrid.stackHorizontal, top: 36, right: 32, bottom: 24 },
    xAxis: {
      type: "value",
      name: "Seats",
      nameLocation: "middle",
      nameGap: 22,
      nameTextStyle: { color: "#8b9bb4", fontSize: 11 },
      ...axisStyle,
      axisLabel: { ...axisStyle.axisLabel, fontSize: 10 },
    },
    yAxis: {
      type: "category",
      data: regions.map((r) => REGION_SHORT[r] ?? r),
      axisLabel: { color: "#e8edf5", fontSize: 11, margin: 8 },
      axisLine: axisStyle.axisLine,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      ...tooltipBase,
      formatter: (raw) => {
        const items = Array.isArray(raw) ? raw : [raw];
        if (!items.length) return "";
        const idx = (items[0] as { dataIndex: number }).dataIndex;
        const region = regions[idx];
        const lines = items
          .filter((it) => Number((it as { value: number }).value) > 0)
          .map(
            (it) =>
              `${(it as { seriesName: string }).seriesName}: ${(it as { value: number }).value}`
          );
        return `<strong>${region}</strong><br/>${lines.join("<br/>")}`;
      },
    },
    legend: {
      top: 2,
      left: "center",
      textStyle: { color: "#8b9bb4", fontSize: 10 },
      itemWidth: 10,
      itemHeight: 7,
      itemGap: 8,
      selectedMode: true,
    },
    series: parties.map((party) => ({
      name: party,
      type: "bar",
      stack: "total",
      barMaxWidth: 28,
      emphasis: { focus: "series" },
      data: regions.map((region) => {
        const row = data.find((d) => d.region === region && d.party === party);
        return row?.seats ?? 0;
      }),
      itemStyle: { color: partyColor(party), borderRadius: [0, 2, 2, 0] },
      label: {
        show: true,
        formatter: (p) => {
          const v = Number((p as { value: number }).value);
          return v >= 3 ? String(v) : "";
        },
        color: "#0c0f14",
        fontSize: 11,
        fontWeight: 600,
      },
    })),
  };
}

export function flipBarOption(
  rows: { region?: string; reserved?: string; flips: number; flip_pct: number; total?: number }[],
  labelKey: "region" | "reserved"
): EChartsOption {
  const isRegion = labelKey === "region";
  // Ascending so highest flip % sits at top of horizontal bars
  const ordered = [...rows].sort((a, b) => a.flip_pct - b.flip_pct);

  const labels = ordered.map((r) => {
    const name = (isRegion ? r.region : r.reserved) ?? "";
    return isRegion ? (REGION_SHORT[name] ?? name) : name;
  });

  return {
    backgroundColor: "transparent",
    grid: {
      ...chartGrid.barHorizontalLongRight,
      right: isRegion ? 128 : 96,
    },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: "{value}%", fontSize: 11, color: "#8b9bb4" },
      splitLine: axisStyle.splitLine,
      axisLine: axisStyle.axisLine,
    },
    yAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: "#e8edf5", fontSize: isRegion ? 13 : 11, margin: 12 },
      axisLine: axisStyle.axisLine,
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        type: "bar",
        barMaxWidth: isRegion ? 32 : 22,
        data: ordered.map((r) => {
          const name = (isRegion ? r.region : r.reserved) ?? "";
          const color = isRegion
            ? (REGION_COLORS[name] ?? "#e8b84a")
            : "#e8b84a";
          return {
            value: r.flip_pct,
            itemStyle: { color, borderRadius: [0, 4, 4, 0] },
          };
        }),
        label: {
          show: true,
          position: "right",
          formatter: (p) => {
            const idx = (p as { dataIndex: number }).dataIndex;
            const row = ordered[idx];
            return `${row.flips} flips · ${row.flip_pct}%`;
          },
          color: "#e8edf5",
          fontSize: 12,
        },
      },
    ],
  };
}

export function retentionOption(
  rows: { party: string; retention_pct: number; retained_2026: number; held_2021: number }[]
): EChartsOption {
  const top = [...rows].sort((a, b) => b.held_2021 - a.held_2021).slice(0, 8);
  return {
    backgroundColor: "transparent",
    grid: chartGrid.barHorizontalLongRight,
    xAxis: { type: "value", max: 100, ...axisStyle },
    yAxis: {
      type: "category",
      data: top.map((r) => r.party),
      axisLabel: { color: "#e8edf5", fontSize: 12, margin: 10 },
      axisLine: axisStyle.axisLine,
    },
    series: [
      {
        type: "bar",
        barWidth: 18,
        data: top.map((r) => ({
          value: r.retention_pct,
          itemStyle: { color: partyColor(r.party), borderRadius: [0, 4, 4, 0] },
        })),
        label: {
          show: true,
          position: "right",
          formatter: (p) => {
            const idx = (p as { dataIndex: number }).dataIndex;
            const row = top[idx];
            return `${row.retained_2026}/${row.held_2021} (${row.retention_pct}%)`;
          },
          color: "#e8edf5",
          fontSize: 11,
        },
      },
    ],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
  };
}

export function bucketOption(rows: { bucket: string; count: number }[]): EChartsOption {
  return {
    backgroundColor: "transparent",
    grid: chartGrid.barVerticalTopLabel,
    xAxis: {
      type: "category",
      data: rows.map((r) => r.bucket),
      axisLabel: { color: "#8b9bb4", fontSize: 11 },
      axisLine: axisStyle.axisLine,
    },
    yAxis: { type: "value", ...axisStyle },
    series: [
      {
        type: "bar",
        barMaxWidth: 48,
        data: rows.map((r) => r.count),
        itemStyle: { color: "#64B5F6", borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: "#e8edf5", fontSize: 11 },
      },
    ],
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
  };
}

export function turnoutByRegionOption(
  rows: { region: string; avg_turnout_pct: number }[]
): EChartsOption {
  const ordered = REGION_ORDER.map(
    (r) => rows.find((x) => x.region === r) ?? { region: r, avg_turnout_pct: 0 }
  );
  return {
    backgroundColor: "transparent",
    grid: { ...chartGrid.barVertical, top: 32, left: 44 },
    xAxis: {
      type: "category",
      data: ordered.map((r) => REGION_SHORT[r.region] ?? r.region),
      axisLabel: { color: "#8b9bb4", fontSize: 11 },
      axisLine: axisStyle.axisLine,
    },
    yAxis: {
      type: "value",
      name: "Turnout % (2021)",
      max: 90,
      nameTextStyle: { color: "#8b9bb4", fontSize: 11 },
      nameLocation: "end",
      nameGap: 14,
      ...axisStyle,
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        type: "bar",
        barMaxWidth: 40,
        data: ordered.map((r) => ({
          value: r.avg_turnout_pct,
          itemStyle: {
            color: REGION_COLORS[r.region] ?? "#78909C",
            borderRadius: [4, 4, 0, 0],
          },
        })),
        label: { show: true, position: "top", color: "#e8edf5", fontSize: 11 },
      },
    ],
  };
}

export function turnoutMarginOption(
  rows: { turnout_pct_2021: number; margin_pct_2026: number; region: string }[]
): EChartsOption {
  const byRegion: Record<string, number[][]> = {};
  rows.forEach((r) => {
    if (r.turnout_pct_2021 == null || Number.isNaN(r.turnout_pct_2021)) return;
    if (!byRegion[r.region]) byRegion[r.region] = [];
    byRegion[r.region].push([r.turnout_pct_2021, r.margin_pct_2026]);
  });
  const regions = REGION_ORDER.filter((r) => byRegion[r]);
  return {
    backgroundColor: "transparent",
    grid: chartGrid.scatter,
    dataZoom: [{ type: "inside", xAxisIndex: 0 }, { type: "inside", yAxisIndex: 0 }],
    xAxis: {
      type: "value",
      name: "Turnout % (2021)",
      nameLocation: "middle",
      nameGap: 30,
      min: 55,
      max: 90,
      ...axisStyle,
    },
    yAxis: {
      type: "value",
      name: "Margin % (2026)",
      nameLocation: "middle",
      nameGap: 40,
      min: 0,
      ...axisStyle,
    },
    tooltip: {
      trigger: "item",
      ...tooltipBase,
      formatter: (p: unknown) => {
        const pt = p as { seriesName?: string; value?: number[] };
        const v = pt.value;
        if (!v) return "";
        return `${pt.seriesName ?? ""}<br/>Turnout 2021: ${v[0].toFixed(1)}%<br/>Margin 2026: ${v[1].toFixed(1)}%`;
      },
    },
    legend: {
      top: 4,
      left: "center",
      textStyle: { color: "#8b9bb4", fontSize: 10 },
      itemWidth: 10,
      itemHeight: 8,
    },
    series: regions.map((region) => ({
      name: REGION_SHORT[region] ?? region,
      type: "scatter",
      symbolSize: 9,
      data: byRegion[region],
      itemStyle: { color: REGION_COLORS[region] ?? "#78909C", opacity: 0.75 },
    })),
  };
}

export function candidateBucketOption(rows: { bucket: string; count: number }[]): EChartsOption {
  return {
    backgroundColor: "transparent",
    grid: chartGrid.barVerticalTopLabel,
    xAxis: {
      type: "category",
      data: rows.map((r) => r.bucket),
      axisLabel: { color: "#8b9bb4", fontSize: 11 },
      axisLine: axisStyle.axisLine,
    },
    yAxis: { type: "value", name: "ACs", ...axisStyle },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        type: "bar",
        barMaxWidth: 48,
        data: rows.map((r) => r.count),
        itemStyle: { color: "#90A4AE", borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: "#e8edf5", fontSize: 11 },
      },
    ],
  };
}

export function enpRegionOption(
  rows: { region: string; enp_2021: number; enp_2026: number }[]
): EChartsOption {
  const ordered = REGION_ORDER.filter((r) => rows.some((x) => x.region === r));
  const data = ordered.map((r) => rows.find((x) => x.region === r)!);
  return {
    backgroundColor: "transparent",
    grid: { left: 44, right: 16, top: 40, bottom: 28, containLabel: false },
    legend: { top: 8, textStyle: { color: "#8b9bb4", fontSize: 10 }, itemHeight: 8, itemWidth: 14 },
    xAxis: {
      type: "category",
      data: data.map((r) => REGION_SHORT[r.region as keyof typeof REGION_SHORT] ?? r.region),
      ...axisStyle,
      axisLabel: { color: "#e8edf5", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      min: 0,
      ...axisStyle,
      name: "Effective parties",
      nameTextStyle: { color: "#8b9bb4", fontSize: 10 },
      nameGap: 14,
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        name: "2021",
        type: "bar",
        barMaxWidth: 22,
        itemStyle: { color: "#56B4E9" },
        data: data.map((r) => r.enp_2021),
      },
      {
        name: "2026",
        type: "bar",
        barMaxWidth: 22,
        itemStyle: { color: "#E69F00" },
        data: data.map((r) => r.enp_2026),
      },
    ],
  };
}

export function swingHeatmapOption(
  rows: { region: string; party_norm: string; swing_pp: number }[]
): EChartsOption {
  const regions = REGION_ORDER.filter((r) => rows.some((x) => x.region === r));
  const parties = Array.from(new Set(rows.map((r) => r.party_norm)));
  parties.sort((a, b) => {
    const sa = Math.max(...rows.filter((r) => r.party_norm === a).map((r) => Math.abs(r.swing_pp)));
    const sb = Math.max(...rows.filter((r) => r.party_norm === b).map((r) => Math.abs(r.swing_pp)));
    return sb - sa;
  });
  const data = rows.map((r) => [
    regions.indexOf(r.region as (typeof regions)[number]),
    parties.indexOf(r.party_norm),
    r.swing_pp,
  ]);
  return {
    backgroundColor: "transparent",
    grid: { left: 64, right: 24, top: 56, bottom: 30 },
    tooltip: {
      ...tooltipBase,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const v = Array.isArray(params) ? params[0].value : params.value;
        return `${regions[v[0]]} · ${parties[v[1]]}: ${v[2] > 0 ? "+" : ""}${v[2]} pp`;
      },
    },
    xAxis: {
      type: "category",
      data: regions.map((r) => REGION_SHORT[r as keyof typeof REGION_SHORT] ?? r),
      ...axisStyle,
      axisLabel: { color: "#e8edf5", fontSize: 10 },
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: parties,
      ...axisStyle,
      axisLabel: { color: "#e8edf5", fontSize: 11 },
      splitArea: { show: true },
    },
    visualMap: {
      min: -25,
      max: 25,
      orient: "horizontal",
      right: 16,
      top: 8,
      itemWidth: 14,
      itemHeight: 90,
      inRange: { color: ["#dc2626", "#0c0f14", "#16a34a"] },
      textStyle: { color: "#8b9bb4", fontSize: 10 },
      text: ["+ gain", "− loss"],
    },
    series: [
      {
        type: "heatmap",
        data,
        label: {
          show: true,
          color: "#fff",
          fontSize: 10,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (p: any) => (p.value[2] === 0 ? "" : `${p.value[2] > 0 ? "+" : ""}${p.value[2]}`),
        },
      },
    ],
  };
}

export function antiIncumbencyOption(
  rows: { slice: string; label: string; incumbent_lost_pct: number; n: number }[]
): EChartsOption {
  const data = rows
    .filter((r) => r.slice === "Region")
    .sort((a, b) => b.incumbent_lost_pct - a.incumbent_lost_pct);
  return {
    backgroundColor: "transparent",
    grid: { left: 110, right: 60, top: 16, bottom: 28, containLabel: false },
    xAxis: { type: "value", min: 0, max: 100, ...axisStyle, axisLabel: { formatter: "{value}%", color: "#8b9bb4", fontSize: 10 } },
    yAxis: {
      type: "category",
      data: data.map((r) => r.label),
      ...axisStyle,
      axisLabel: { color: "#e8edf5", fontSize: 11 },
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        type: "bar",
        barMaxWidth: 22,
        data: data.map((r) => ({
          value: r.incumbent_lost_pct,
          itemStyle: { color: REGION_COLORS[r.label] ?? "#38bdf8", borderRadius: [0, 3, 3, 0] },
        })),
        label: { show: true, position: "right", formatter: "{c}%", color: "#e8edf5", fontSize: 10, distance: 4 },
      },
    ],
  };
}

export function representationGapOption(
  rows: { party_norm: string; vote_share_pct: number; seat_share_pct: number; representation_gap_pp: number }[]
): EChartsOption {
  const top = rows
    .filter((r) => r.vote_share_pct >= 0.5 || r.seat_share_pct >= 0.5)
    .slice(0, 10);
  return {
    backgroundColor: "transparent",
    grid: { left: 64, right: 20, top: 36, bottom: 28, containLabel: false },
    legend: { top: 8, textStyle: { color: "#8b9bb4", fontSize: 10 }, itemHeight: 8, itemWidth: 14 },
    xAxis: { type: "value", ...axisStyle, axisLabel: { formatter: "{value}%", color: "#8b9bb4", fontSize: 10 } },
    yAxis: {
      type: "category",
      data: top.map((r) => r.party_norm),
      ...axisStyle,
      axisLabel: { color: "#e8edf5", fontSize: 11 },
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        name: "Vote share",
        type: "bar",
        barMaxWidth: 14,
        itemStyle: { color: "#56B4E9" },
        data: top.map((r) => r.vote_share_pct),
      },
      {
        name: "Seat share",
        type: "bar",
        barMaxWidth: 14,
        itemStyle: { color: "#E69F00" },
        data: top.map((r) => r.seat_share_pct),
      },
    ],
  };
}

export function raceTypeOption(rows: { race_type: string; count: number }[]): EChartsOption {
  return {
    backgroundColor: "transparent",
    grid: { left: 36, right: 16, top: 24, bottom: 56, containLabel: false },
    xAxis: {
      type: "category",
      data: rows.map((r) => r.race_type),
      ...axisStyle,
      axisLabel: {
        ...axisStyle.axisLabel,
        fontSize: 10,
        interval: 0,
        rotate: 0,
        width: 110,
        overflow: "break",
        lineHeight: 12,
      },
    },
    yAxis: {
      type: "value",
      ...axisStyle,
      name: "constituencies",
      nameTextStyle: { color: "#8b9bb4", fontSize: 10 },
      nameGap: 14,
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        type: "bar",
        barMaxWidth: 60,
        data: rows.map((r, i) => ({
          value: r.count,
          itemStyle: { color: ["#dc2626", "#E69F00", "#16a34a"][i % 3], borderRadius: [4, 4, 0, 0] },
        })),
        label: { show: true, position: "top", color: "#e8edf5", fontSize: 11, distance: 4 },
      },
    ],
  };
}

export function regionalVoteShareOption(
  rows: { region: string; party: string; vote_share_pct: number }[],
  year: string
): EChartsOption {
  const regions = REGION_ORDER.filter((r) => rows.some((x) => x.region === r));
  const parties = Array.from(new Set(rows.map((r) => r.party))).filter((p) => p !== "Other");
  parties.sort((a, b) => {
    const sa = rows.filter((r) => r.party === a).reduce((s, r) => s + r.vote_share_pct, 0);
    const sb = rows.filter((r) => r.party === b).reduce((s, r) => s + r.vote_share_pct, 0);
    return sb - sa;
  });
  const stackKeys = [...parties.slice(0, 6), "Other"];
  return {
    backgroundColor: "transparent",
    title: { text: `Vote share by region — ${year}`, left: 0, textStyle: { color: "#8b9bb4", fontSize: 11 } },
    grid: { ...chartGrid.barHorizontal, top: 56, left: 12, right: 12, bottom: 20 },
    legend: { top: 26, textStyle: { color: "#8b9bb4", fontSize: 10 }, itemHeight: 8, itemWidth: 14 },
    xAxis: {
      type: "category",
      data: regions.map((r) => REGION_SHORT[r] ?? r),
      ...axisStyle,
    },
    yAxis: { type: "value", max: 100, ...axisStyle, axisLabel: { formatter: "{value}%" } },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: stackKeys.map((party) => ({
      name: party,
      type: "bar",
      stack: "total",
      barMaxWidth: 36,
      itemStyle: { color: partyColor(party) },
      data: regions.map((region) => {
        const row = rows.find((r) => r.region === region && r.party === party);
        return row ? row.vote_share_pct : 0;
      }),
    })),
  };
}

export function turnoutDeltaOption(
  rows: { constituency: string; region: string; turnout_delta: number }[]
): EChartsOption {
  const top = [...rows].sort((a, b) => b.turnout_delta - a.turnout_delta).slice(0, 20).reverse();
  return {
    backgroundColor: "transparent",
    grid: { ...chartGrid.barHorizontalLabeled, left: 8, right: 64, bottom: 20 },
    xAxis: { type: "value", ...axisStyle, axisLabel: { formatter: "+{value}pp" } },
    yAxis: {
      type: "category",
      data: top.map((r) => (r.constituency.length > 22 ? `${r.constituency.slice(0, 20)}…` : r.constituency)),
      axisLabel: { color: "#e8edf5", fontSize: 10, width: 120, overflow: "truncate" },
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        type: "bar",
        barMaxWidth: 22,
        data: top.map((r) => ({
          value: Number(r.turnout_delta.toFixed(2)),
          itemStyle: { color: REGION_COLORS[r.region] ?? "#38bdf8", borderRadius: [0, 3, 3, 0] },
        })),
        label: { show: true, position: "right", formatter: "+{c}pp", color: "#e8edf5", fontSize: 10, distance: 4 },
      },
    ],
  };
}

export function notaBarOption(
  rows: { ac_name: string; nota_pct: number }[],
  limit = 12
): EChartsOption {
  const top = [...rows].sort((a, b) => b.nota_pct - a.nota_pct).slice(0, limit).reverse();
  return {
    backgroundColor: "transparent",
    grid: { ...chartGrid.barHorizontalLabeled, left: 8, right: 56, bottom: 20 },
    xAxis: { type: "value", ...axisStyle, axisLabel: { formatter: "{value}%" } },
    yAxis: {
      type: "category",
      data: top.map((r) => (r.ac_name.length > 22 ? `${r.ac_name.slice(0, 20)}…` : r.ac_name)),
      axisLabel: { color: "#e8edf5", fontSize: 10, width: 120, overflow: "truncate" },
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...tooltipBase },
    series: [
      {
        type: "bar",
        barMaxWidth: 22,
        data: top.map((r) => ({
          value: r.nota_pct,
          itemStyle: { color: "#78909C", borderRadius: [0, 3, 3, 0] },
        })),
        label: {
          show: true,
          position: "right",
          formatter: "{c}%",
          color: "#e8edf5",
          fontSize: 10,
          distance: 4,
        },
      },
    ],
  };
}

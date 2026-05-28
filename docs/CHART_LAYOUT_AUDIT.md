# Chart layout audit — all pages

Checklist for **overlap**, **right-edge trim**, and **bottom trim**.  
Implementation: `web/src/lib/panelLayout.ts`, `web/src/components/ChartPanel.tsx`, `web/src/charts/chartLayout.ts`.

| Layout primitive | Use when |
|------------------|----------|
| `panelHeightMd` / `Lg` / `Xl` | Single chart or map panel (fixed px height) |
| `chartStack` | 2 charts in right column (Statewide, Geography, Margins) |
| `chartPageStack` | Vertical stack (Seat flows) |
| `pageChartGrid2` | 2 columns of equal panels (Ballots & turnout, Reserved, Explorer) |
| `pageChartGridSplit` | Map/mosaic left + `chartStack` right |
| `ChartPanel` | Standard chart wrapper (`height`: md \| lg \| xl \| fill) |
| `chartAreaCompact` | ECharts slot — **no** extra min-height |

---

## 0. Editorial brief (`/`)

No charts — text and run-of-show links only.

---

## 1. Statewide (`/overview`)

| Chart | Layout | Status |
|-------|--------|--------|
| KPI strip | Grid | ✅ |
| Mosaic | `panelHeightLg` + `chartAreaMosaic` | ✅ |
| Seat tally | `chartStack` → `ChartPanel` fill | ✅ |
| Vote share | `chartStack` → `ChartPanel` fill | ✅ |

---

## 2. Seat flows (`/flows`)

| Chart | Layout | Status |
|-------|--------|--------|
| Sankey | `chartPageStack` → `ChartPanel` xl | ✅ |
| Retention | `chartPageStack` → `ChartPanel` md | ✅ |

---

## 3. Geography (`/geography`)

| Chart | Layout | Status |
|-------|--------|--------|
| District map | `panelHeightLg` | ✅ |
| Regional stack | `chartStack` → `ChartPanel` fill | ✅ |
| Flip rate | `chartStack` → `ChartPanel` fill | ✅ |

---

## 4. Margins (`/margins`)

| Chart | Layout | Status |
|-------|--------|--------|
| Margin scatter | `panelHeightLg` + `chartArea` | ✅ |
| Vote share buckets | `chartStack` → `ChartPanel` fill | ✅ |
| Closest races table | `chartStack` → `tableScroll` | ✅ |

---

## 5. Reserved (`/reserved`)

| Chart | Layout | Status |
|-------|--------|--------|
| Flip by category | `ChartPanel` md | ✅ |
| Party × reserved table | `panelHeightMd` + `tableScroll` | ✅ |

---

## 6. Ballots & turnout (`/depth`)

| Chart | Layout | Status |
|-------|--------|--------|
| Turnout by region | `pageChartGrid2` → `ChartPanel` md | ✅ |
| Turnout vs margin | `ChartPanel` md | ✅ |
| Candidate buckets | `ChartPanel` md | ✅ |
| NOTA top 12 | `ChartPanel` md | ✅ |

---

## 7. Explorer (`/explorer`)

| Chart | Layout | Status |
|-------|--------|--------|
| Filtered seat tally | `pageChartGrid2` → `ChartPanel` md | ✅ |
| Margin scatter | `ChartPanel` md | ✅ |
| AC table | `panelHeightMd` + `tableScroll` | ✅ |

---

## 8. Deep insights (`/deep`)

| Chart | Layout | Status |
|-------|--------|--------|
| KPI strip (5 indices) | Grid | ✅ |
| ENP by region | `ChartPanel` lg | ✅ |
| Pedersen by region | `ChartPanel` lg | ✅ |
| Swing heatmap (party × region) | `ChartPanel` xl | ✅ |
| Anti-incumbency by region | `ChartPanel` lg | ✅ |
| Vote share vs seat share | `ChartPanel` lg | ✅ |
| Race competitiveness buckets | `ChartPanel` md | ✅ |
| District churn table | `Panel` + tableScroll | ✅ |
| Glossary | `panel` text block | ✅ |

Page scrolls intentionally (8+ panels). Heatmap label color flips at vmax×0.4 for legibility.

---

## 9. Sources (`/methods`)

No charts — text only.

---

## QA (all pages, ~3 min)

1. Hard-refresh (`Cmd+Shift+R`).
2. Open each nav item; confirm **no chart drawn on top of another**.
3. Check **right edge** of every bar/Sankey label.
4. `cd web && npm run test:e2e`

---

## Related

- `docs/DASHBOARD_QA.md`
- `docs/VIDEO_NARRATION_SCRIPT.md`

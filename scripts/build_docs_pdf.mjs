#!/usr/bin/env node
/**
 * Build professional PDF documentation bundle.
 *
 * Reads all project markdown docs, renders them with marked + highlight.js (CDN),
 * and uses Playwright Chromium to print to high-quality PDFs.
 *
 * Outputs:
 *   - outputs/docs_pdf/<doc_name>.pdf       (individual PDFs)
 *   - outputs/docs_pdf/TN_2026_Documentation.pdf  (combined master PDF)
 *
 * Usage:
 *   node scripts/build_docs_pdf.mjs
 */

import { chromium } from "/Users/gunasekaran/Documents/Workspace/Codebasics Hackathon/web/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "outputs", "docs_pdf");

const DOCS = [
  {
    file: "README.md",
    title: "Project Overview",
    section: "1 · Project Overview",
    pageLabel: "README",
  },
  {
    file: "HACKATHON_EXECUTION_PLAN.md",
    title: "Hackathon Execution Plan",
    section: "2 · Hackathon Execution Plan",
    pageLabel: "Execution Plan",
  },
  {
    file: "docs/METRIC_DEFINITIONS.md",
    title: "Metric Definitions",
    section: "3 · Metric Definitions",
    pageLabel: "Metric Definitions",
  },
  {
    file: "docs/DASHBOARD_QA.md",
    title: "Dashboard QA",
    section: "4 · Dashboard QA",
    pageLabel: "Dashboard QA",
  },
  {
    file: "docs/DASHBOARD_REUSE.md",
    title: "Dashboard Reuse Guide",
    section: "5 · Dashboard Reuse Guide",
    pageLabel: "Reuse Guide",
  },
  {
    file: "docs/CHART_LAYOUT_AUDIT.md",
    title: "Chart Layout Audit",
    section: "6 · Chart Layout Audit",
    pageLabel: "Chart Layout Audit",
  },
  {
    file: "docs/VIDEO_NARRATION_SCRIPT.md",
    title: "Video Narration Script",
    section: "7 · Video Narration Script",
    pageLabel: "Narration Script",
  },
  {
    file: "docs/VISUAL_AND_REFERENCE_MASTER.md",
    title: "Visual & Reference Master",
    section: "8 · Visual & Reference Master",
    pageLabel: "Visual Reference",
  },
  {
    file: "AGENTS.md",
    title: "Agent Instructions",
    section: "9 · Agent Instructions",
    pageLabel: "Agent Instructions",
  },
];

const NOW = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const PROJECT_TITLE = "Tamil Nadu Assembly Election 2026";
const PROJECT_SUBTITLE = "AtliQ Media — Neutral Election Briefing";
const PROJECT_FOOTER =
  "Codebasics Resume Project Challenge #21 · ECI public data · Descriptive analysis only";

const CSS = `
  :root {
    --ink: #11161f;
    --ink-2: #2a3548;
    --muted: #5b6878;
    --accent: #1f6fb2;
    --accent-2: #b35900;
    --code-bg: #f4f6fa;
    --code-border: #d9dee8;
    --border: #d9dee8;
    --rule: #e2e6ee;
    --table-stripe: #f7f9fc;
    --serif: "Source Serif Pro", "Georgia", "Times New Roman", serif;
    --sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    --mono: "JetBrains Mono", "SF Mono", "Menlo", "Consolas", monospace;
  }
  @page {
    size: A4;
    margin: 22mm 18mm 22mm 18mm;
  }
  html, body { background: white; color: var(--ink); }
  body {
    font-family: var(--sans);
    font-size: 10.5pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
  }

  /* Cover — fits within @page margins (no full bleed) so header/footer don't overlap */
  .cover {
    page-break-after: always;
    height: 253mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 22mm 20mm;
    box-sizing: border-box;
    background: linear-gradient(180deg, #0f1419 0%, #1a2230 100%);
    color: #f1f5f9;
    border-radius: 4mm;
    overflow: hidden;
  }
  .cover .brand {
    font-family: var(--sans);
    font-size: 9pt;
    letter-spacing: 2.2px;
    text-transform: uppercase;
    color: #94a3b8;
  }
  .cover .title {
    font-family: var(--serif);
    font-size: 38pt;
    line-height: 1.08;
    color: #fcd34d;
    margin-top: 14mm;
    font-weight: 700;
  }
  .cover .subtitle {
    font-family: var(--sans);
    font-size: 14pt;
    color: #cbd5e1;
    margin-top: 4mm;
    font-weight: 400;
  }
  .cover .doc-type {
    font-family: var(--sans);
    font-size: 11pt;
    color: #fbbf24;
    margin-top: 16mm;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
  .cover .meta {
    font-family: var(--mono);
    font-size: 9pt;
    color: #94a3b8;
    border-top: 1px solid #334155;
    padding-top: 6mm;
  }
  .cover .meta b { color: #cbd5e1; font-weight: 600; }

  /* TOC */
  .toc {
    page-break-after: always;
  }
  .toc h1 {
    font-family: var(--serif);
    font-size: 22pt;
    margin: 0 0 8mm 0;
    border-bottom: 2px solid var(--ink);
    padding-bottom: 4mm;
  }
  .toc ol {
    list-style: none;
    padding: 0;
    margin: 0;
    counter-reset: toc;
  }
  .toc li {
    counter-increment: toc;
    display: flex;
    justify-content: space-between;
    padding: 2.5mm 0;
    border-bottom: 1px dotted var(--rule);
    font-size: 11pt;
  }
  .toc li::before {
    content: counter(toc, decimal-leading-zero) "  ";
    color: var(--muted);
    font-family: var(--mono);
    margin-right: 6mm;
    min-width: 14mm;
  }
  .toc li .title { flex: 1; }
  .toc li .page { color: var(--muted); font-family: var(--mono); font-size: 9pt; }

  /* Section pages */
  .section {
    page-break-before: always;
  }
  .section-header {
    border-bottom: 3px solid var(--ink);
    padding-bottom: 4mm;
    margin-bottom: 8mm;
  }
  .section-header .kicker {
    font-family: var(--sans);
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--accent);
    font-weight: 600;
  }
  .section-header h1 {
    font-family: var(--serif);
    font-size: 26pt;
    margin: 2mm 0 0 0;
    line-height: 1.12;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--serif);
    color: var(--ink);
    page-break-after: avoid;
    line-height: 1.25;
  }
  h1 { font-size: 19pt; margin: 8mm 0 3mm 0; border-bottom: 1px solid var(--rule); padding-bottom: 1.5mm; }
  h2 { font-size: 14.5pt; margin: 6mm 0 2.5mm 0; color: var(--ink); }
  h3 { font-size: 12pt; margin: 5mm 0 2mm 0; color: var(--ink-2); }
  h4 { font-size: 10.5pt; margin: 4mm 0 1.5mm 0; color: var(--ink-2); font-weight: 700; }
  p { margin: 0 0 3mm 0; orphans: 3; widows: 3; }
  ul, ol { margin: 0 0 3mm 4mm; padding: 0; }
  li { margin: 0 0 1mm 0; }
  ul li::marker { color: var(--accent); }

  /* Links */
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Inline code */
  code {
    font-family: var(--mono);
    font-size: 9pt;
    background: var(--code-bg);
    border: 1px solid var(--code-border);
    padding: 0.5px 4px;
    border-radius: 3px;
    color: var(--accent-2);
  }

  /* Code blocks */
  pre {
    background: #0f1419;
    color: #e2e8f0;
    border-radius: 6px;
    padding: 4mm 5mm;
    overflow-x: hidden;
    page-break-inside: avoid;
    margin: 3mm 0 5mm 0;
    font-size: 8.5pt;
    line-height: 1.5;
    border: 1px solid #2a3548;
  }
  pre code {
    background: transparent;
    border: 0;
    padding: 0;
    color: inherit;
    font-size: inherit;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 3mm 0 5mm 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 2mm 3mm;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--ink);
    color: white;
    font-weight: 600;
    font-size: 9pt;
    letter-spacing: 0.5px;
  }
  tr:nth-child(even) td { background: var(--table-stripe); }

  /* Blockquotes */
  blockquote {
    border-left: 3px solid var(--accent);
    background: #f0f6fc;
    padding: 3mm 5mm;
    margin: 3mm 0 5mm 0;
    color: var(--ink-2);
    font-style: italic;
    page-break-inside: avoid;
  }
  blockquote p:last-child { margin-bottom: 0; }

  /* Horizontal rule */
  hr {
    border: 0;
    border-top: 1px solid var(--rule);
    margin: 6mm 0;
  }

  /* Mermaid placeholder block (raw) — show as code */
  .lang-mermaid {
    color: #94a3b8;
    font-style: italic;
  }
`;

// Header / footer templates (Chromium PDF supports limited HTML)
function headerTemplate() {
  return `
    <div style="font-family: -apple-system, sans-serif; font-size: 8pt; color: #94a3b8;
                width: 100%; padding: 4mm 18mm 0 18mm; display: flex;
                justify-content: space-between; border-bottom: 0.5px solid #cbd5e1;
                padding-bottom: 2mm;">
      <span>${PROJECT_TITLE}</span>
      <span class="title" style="font-weight: 600; color: #475569;"></span>
    </div>
  `;
}

function footerTemplate(label) {
  return `
    <div style="font-family: -apple-system, sans-serif; font-size: 8pt; color: #94a3b8;
                width: 100%; padding: 0 18mm 4mm 18mm; display: flex;
                justify-content: space-between; border-top: 0.5px solid #cbd5e1;
                padding-top: 2mm; margin-top: 4mm;">
      <span>${label}</span>
      <span>${PROJECT_FOOTER}</span>
      <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `;
}

const HTML_HEAD = `
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.10.0/styles/atom-one-dark.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/marked@13.0.3/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11.10.0/lib/common.min.js"></script>
  <style>${CSS}</style>
`;

function coverPageHTML(docTitle) {
  return `
    <section class="cover">
      <div>
        <p class="brand">AtliQ Media · Codebasics RPC #21</p>
        <h1 class="title">${PROJECT_TITLE}</h1>
        <p class="subtitle">${PROJECT_SUBTITLE}</p>
        <p class="doc-type">${docTitle}</p>
      </div>
      <div class="meta">
        <p><b>ECI public data only</b> · 234 constituencies · 2021 vs 2026</p>
        <p>Generated: ${NOW} · Descriptive analysis · No predictions, no causal claims</p>
      </div>
    </section>
  `;
}

function tocHTML(items) {
  const rows = items
    .map(
      (it) =>
        `<li><span class="title">${it.title}</span><span class="page">${it.pageLabel}</span></li>`
    )
    .join("\n");
  return `
    <section class="toc">
      <h1>Documentation Bundle — Table of Contents</h1>
      <ol>${rows}</ol>
      <p style="margin-top: 12mm; color: var(--muted); font-size: 9pt;">
        This bundle compiles all design, methodology, QA, and reuse documentation
        for the Tamil Nadu Assembly 2026 election briefing submission.
      </p>
    </section>
  `;
}

function sectionHTML(doc, body) {
  return `
    <section class="section">
      <header class="section-header">
        <p class="kicker">${doc.section}</p>
        <h1>${doc.title}</h1>
      </header>
      ${body}
    </section>
  `;
}

function singleDocHTML(doc, body) {
  return `<!doctype html><html><head>${HTML_HEAD}</head><body>
    ${coverPageHTML(doc.title)}
    ${sectionHTML(doc, body)}
    <script>
      marked.setOptions({
        gfm: true, breaks: false, headerIds: false, mangle: false,
        highlight: (code, lang) => {
          try { return hljs.highlightAuto(code, lang ? [lang] : undefined).value; }
          catch { return code; }
        }
      });
      document.querySelectorAll("pre code").forEach(b => hljs.highlightElement(b));
    </script>
  </body></html>`;
}

function bundleHTML(sections) {
  const tocItems = sections.map((s) => ({ title: s.doc.title, pageLabel: s.doc.pageLabel }));
  const body = sections.map((s) => sectionHTML(s.doc, s.body)).join("\n");
  return `<!doctype html><html><head>${HTML_HEAD}</head><body>
    ${coverPageHTML("Documentation Bundle")}
    ${tocHTML(tocItems)}
    ${body}
    <script>
      document.querySelectorAll("pre code").forEach(b => hljs.highlightElement(b));
    </script>
  </body></html>`;
}

async function renderMarkdownInPage(page, md) {
  await page.evaluate((m) => {
    document.body.innerHTML += `<div id="__rendered"></div>`;
    document.getElementById("__rendered").innerHTML = window.marked.parse(m);
  }, md);
  return await page.evaluate(() => {
    const el = document.getElementById("__rendered");
    const html = el.innerHTML;
    el.remove();
    return html;
  });
}

async function loadAndRender(filePath, page) {
  const md = await fs.readFile(filePath, "utf-8");
  return await renderMarkdownInPage(page, md);
}

async function buildPDF(page, html, outPath, label) {
  await page.setContent(html, { waitUntil: "networkidle", timeout: 30000 });
  // Allow fonts and highlight.js to settle
  await page.waitForTimeout(400);
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerTemplate(),
    footerTemplate: footerTemplate(label),
    margin: { top: "22mm", bottom: "22mm", left: "18mm", right: "18mm" },
  });
  const stat = await fs.stat(outPath);
  console.log(`  → ${path.relative(ROOT, outPath)}  (${(stat.size / 1024).toFixed(1)} kB)`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Building documentation PDFs → ${path.relative(ROOT, OUT)}`);

  // Load marked + highlight.js once via blank page with HEAD scripts
  await page.setContent(`<!doctype html><html><head>${HTML_HEAD}</head><body></body></html>`, {
    waitUntil: "networkidle",
  });

  // Wait for marked global
  await page.waitForFunction(() => window.marked, { timeout: 15000 });

  // Render each doc body, accumulate for bundle, write individual PDFs
  const sections = [];
  for (const doc of DOCS) {
    const filePath = path.join(ROOT, doc.file);
    console.log(`\n· ${doc.file}`);
    let body;
    try {
      body = await loadAndRender(filePath, page);
    } catch (e) {
      console.warn(`  skipped (${e.message})`);
      continue;
    }
    sections.push({ doc, body });

    const slug = doc.file.replace(/\//g, "_").replace(/\.md$/, "");
    const outPath = path.join(OUT, `${slug}.pdf`);
    await buildPDF(page, singleDocHTML(doc, body), outPath, doc.pageLabel);
  }

  // Bundle
  console.log(`\n· Combined bundle`);
  const bundlePath = path.join(OUT, "TN_2026_Documentation.pdf");
  await buildPDF(page, bundleHTML(sections), bundlePath, "Documentation Bundle");

  await browser.close();
  console.log(`\nDone. ${sections.length + 1} PDFs written to ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

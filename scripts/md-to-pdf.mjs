import { readFileSync } from "fs";
import { chromium } from "playwright-core";

const md = readFileSync("DOCS.md", "utf-8");

// Simple markdown to HTML conversion
function mdToHtml(text) {
  let html = text;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Tables
  html = html.replace(
    /^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm,
    (_, header, sep, body) => {
      const ths = header.split("|").filter(Boolean).map((c) => `<th>${c.trim()}</th>`).join("");
      const rows = body.trim().split("\n").map((row) => {
        const tds = row.split("|").filter(Boolean).map((c) => `<td>${c.trim()}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("\n");
      return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    }
  );

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Unordered lists
  html = html.replace(/^- \[x\]\s+(.+)$/gm, '<li class="task done">$1</li>');
  html = html.replace(/^- \[ \]\s+(.+)$/gm, '<li class="task">$1</li>');
  html = html.replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Horizontal rules
  html = html.replace(/^---+$/gm, "<hr>");

  // Paragraphs (lines that aren't already wrapped)
  html = html.replace(/^(?!<[a-z])((?!<).+)$/gm, "<p>$1</p>");

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}

const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  :root {
    --accent: #22C9AC;
    --text: #1A1A1A;
    --muted: #6B7280;
    --border: #EAECF0;
    --bg: #F8F9FA;
    --surface: #FFFFFF;
  }

  * { box-sizing: border-box; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
    line-height: 1.65;
    max-width: 210mm;
    margin: 0 auto;
    padding: 32px 40px;
    font-size: 10.5pt;
  }

  h1, h2, h3, h4 {
    font-family: 'Sora', system-ui, sans-serif;
    color: var(--text);
    margin-top: 1.8em;
    margin-bottom: 0.5em;
    page-break-after: avoid;
  }

  h1 {
    font-size: 22pt;
    color: var(--accent);
    border-bottom: 3px solid var(--accent);
    padding-bottom: 8px;
    margin-top: 0;
  }

  h2 {
    font-size: 14pt;
    color: var(--accent);
    border-bottom: 1px solid var(--border);
    padding-bottom: 4px;
  }

  h3 { font-size: 12pt; color: #0D9488; }
  h4 { font-size: 11pt; }

  p { margin: 0.5em 0; }

  blockquote {
    border-left: 3px solid var(--accent);
    margin: 1em 0;
    padding: 8px 16px;
    background: #F0FDF9;
    color: var(--muted);
    font-style: italic;
  }

  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    background: #F1F5F9;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 9.5pt;
  }

  pre {
    background: #1E293B;
    color: #E2E8F0;
    padding: 14px 18px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.5;
    page-break-inside: avoid;
  }

  pre code {
    background: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }

  th {
    background: var(--accent);
    color: white;
    font-weight: 600;
    text-align: left;
    padding: 8px 12px;
  }

  td {
    padding: 6px 12px;
    border-bottom: 1px solid var(--border);
  }

  tr:nth-child(even) td { background: #F8FAFB; }

  ul {
    padding-left: 20px;
    margin: 0.5em 0;
  }

  li { margin: 3px 0; }

  li.task { list-style: none; margin-left: -20px; }
  li.task::before { content: "☐ "; color: var(--muted); }
  li.task.done::before { content: "☑ "; color: var(--accent); }

  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2em 0;
  }

  strong { color: var(--text); }

  /* Print */
  @page {
    size: A4;
    margin: 20mm 15mm;
  }

  @media print {
    body { padding: 0; }
    pre { break-inside: avoid; }
    h2, h3 { break-after: avoid; }
    table { break-inside: avoid; }
  }
</style>
</head>
<body>
${mdToHtml(md)}
</body>
</html>`;

const browser = await chromium.launch({
  executablePath: "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage();
await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
await page.pdf({
  path: "DOCS.pdf",
  format: "A4",
  margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  printBackground: true,
});
await browser.close();
console.log("PDF generato: DOCS.pdf");

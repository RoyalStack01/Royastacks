import { readFile } from "fs/promises";
import * as path from "path";
import Link from "next/link";
import { API_BASE_URL } from "../../lib/config";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inlineMarkdown(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let html = "";
  let inCodeBlock = false;
  let inList = false;
  let listType: "ul" | "ol" = "ul";
  let tableRows: string[] = [];

  const flushList = () => {
    if (inList) {
      html += `</${listType}>`;
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const rows = tableRows
      .map((row) => row.trim().replace(/^\||\|$/g, ""))
      .map((row) => row.split("|").map((cell) => cell.trim()));
    const header = rows[0] ?? [];
    const divider = rows[1] ?? [];
    const body = rows.slice(2);
    const isTable = divider.every((cell) => /^:?-+:?$/.test(cell));

    if (isTable) {
      html += "<table>";
      html += "<thead><tr>";
      header.forEach((cell) => {
        html += `<th>${inlineMarkdown(cell)}</th>`;
      });
      html += "</tr></thead>";
      if (body.length) {
        html += "<tbody>";
        body.forEach((cells) => {
          html += "<tr>";
          cells.forEach((cell) => {
            html += `<td>${inlineMarkdown(cell)}</td>`;
          });
          html += "</tr>";
        });
        html += "</tbody>";
      }
      html += "</table>";
    } else {
      tableRows.forEach((row) => {
        html += `<p>${inlineMarkdown(row)}</p>`;
      });
    }
    tableRows = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushList();
      flushTable();
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        html += "<pre><code>";
      } else {
        html += "</code></pre>";
      }
      continue;
    }

    if (inCodeBlock) {
      html += `${escapeHtml(line)}\n`;
      continue;
    }

    if (line.trim() === "") {
      flushList();
      flushTable();
      html += "";
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      flushTable();
      const level = headingMatch[1].length;
      html += `<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`;
      continue;
    }

    if (/^>\s?(.*)$/.test(line)) {
      flushList();
      flushTable();
      const content = line.replace(/^>\s?/, "");
      html += `<blockquote>${inlineMarkdown(content)}</blockquote>`;
      continue;
    }

    const listMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[1]);
      const currentType = ordered ? "ol" : "ul";
      if (!inList || listType !== currentType) {
        flushList();
        flushTable();
        listType = currentType;
        inList = true;
        html += `<${listType}>`;
      }
      html += `<li>${inlineMarkdown(listMatch[2])}</li>`;
      continue;
    }

    if (line.trim().startsWith("|") && line.includes("|")) {
      if (!inList) {
        tableRows.push(line);
        continue;
      }
    }

    flushList();
    if (line.includes("|")) {
      tableRows.push(line);
      continue;
    }

    flushTable();
    html += `<p>${inlineMarkdown(line)}</p>`;
  }

  flushList();
  flushTable();
  return html;
}

async function loadIntegrationContent() {
  const filePath = path.join(process.cwd(), "integration.md");
  return readFile(filePath, "utf8");
}

export default async function IntegrationPage() {
  const markdown = await loadIntegrationContent();
  const content = renderMarkdown(markdown);

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>Integration Guide</h1>
          <p style={{ margin: "8px 0 0", color: "#888" }}>
            From <code>integration.md</code>
          </p>
          <p style={{ margin: "8px 0 0", color: "#666", fontSize: 14 }}>
            Server base URL: <code>{API_BASE_URL}</code>
          </p>
        </div>
        <Link
          href="/"
          style={{ color: "#e8003a", fontWeight: 700, textDecoration: "none" }}
        >
          Back to home
        </Link>
      </div>
      <article
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ gap: 16, display: "grid" }}
      />
    </main>
  );
}

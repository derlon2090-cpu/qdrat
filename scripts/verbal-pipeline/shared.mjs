import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");

const currentFile = fileURLToPath(import.meta.url);

export const ROOT_DIR = path.resolve(path.dirname(currentFile), "..", "..");
export const RAW_DIR = path.join(ROOT_DIR, "data", "raw");
export const PARSED_DIR = path.join(ROOT_DIR, "data", "parsed");
export const REPORTS_DIR = path.join(ROOT_DIR, "data", "reports");

const ARABIC_LETTER = /[\u0600-\u06FF]/;
const OPTION_KEY_MAP = new Map([
  ["ا", "A"],
  ["أ", "A"],
  ["ب", "B"],
  ["ج", "C"],
  ["د", "D"],
  ["A", "A"],
  ["B", "B"],
  ["C", "C"],
  ["D", "D"],
]);

export function getOptionKeyMap() {
  return OPTION_KEY_MAP;
}

export async function ensurePipelineDirs() {
  await fs.mkdir(RAW_DIR, { recursive: true });
  await fs.mkdir(PARSED_DIR, { recursive: true });
  await fs.mkdir(REPORTS_DIR, { recursive: true });
}

export async function listPdfFiles() {
  await ensurePipelineDirs();
  const entries = await fs.readdir(RAW_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => path.join(RAW_DIR, entry.name))
    .sort();
}

export function toSlug(input) {
  return path
    .basename(input, path.extname(input))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "source";
}

export async function writeJson(filePath, value) {
  await ensurePipelineDirs();
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

export function getRawOutputPath(slug) {
  return path.join(PARSED_DIR, `${slug}.raw.json`);
}

export function getNormalizedOutputPath(slug) {
  return path.join(PARSED_DIR, `${slug}.normalized.json`);
}

export function getReportOutputPath(slug) {
  return path.join(REPORTS_DIR, `${slug}.report.json`);
}

export function getLatestReportPath() {
  return path.join(REPORTS_DIR, "latest-verbal-report.json");
}

export function decodePdfText(text) {
  const value = text || "";

  try {
    return decodeURIComponent(value).replace(/\s+/g, " ").trim();
  } catch {
    return value.replace(/\s+/g, " ").trim();
  }
}

function fixArabicToken(token) {
  if (!ARABIC_LETTER.test(token)) {
    return token;
  }
  return [...token].reverse().join("");
}

export function normalizeArabicLine(line) {
  const tokens = line
    .replace(/[\u200e\u200f]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(fixArabicToken)
    .reverse();

  return tokens
    .join(" ")
    .replace(/\)\s*(\d+)\s*\(/g, "($1)")
    .replace(/\(\s*(\d+)\s*\)/g, "($1)")
    .replace(/\s+([،.:؟!])/g, "$1")
    .replace(/([(:])\s+/g, "$1")
    .replace(/\s+\)/g, ")")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getColorHint(item) {
  if (item.oc) {
    return item.oc;
  }
  if (item.clr !== undefined && item.clr !== null) {
    return `clr:${item.clr}`;
  }
  return null;
}

function getDominantColor(items) {
  const counts = new Map();
  for (const item of items) {
    const hint = getColorHint(item);
    if (!hint) {
      continue;
    }
    counts.set(hint, (counts.get(hint) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function groupTextLines(texts = []) {
  const groups = [];

  for (const text of texts) {
    const decoded = decodePdfText(text.R?.[0]?.T);
    if (!decoded) {
      continue;
    }

    const y = text.y;
    let group = groups.find((entry) => Math.abs(entry.y - y) < 0.22);
    if (!group) {
      group = { y, items: [] };
      groups.push(group);
    }

    group.items.push({
      text: decoded,
      x: text.x,
      y: text.y,
      colorHint: getColorHint(text),
    });
  }

  return groups
    .sort((a, b) => a.y - b.y)
    .map((group) => {
      const items = group.items.sort((a, b) => a.x - b.x);
      const raw = items.map((item) => item.text).join(" ").replace(/\s{2,}/g, " ").trim();
      return {
        y: group.y,
        raw,
        normalized: normalizeArabicLine(raw),
        dominantColor: getDominantColor(items),
        items,
      };
    });
}

export async function extractPdfAsRaw(sourcePath) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1);
    const originalWarn = console.warn;
    const originalLog = console.log;

    const silence = (method, args) => {
      const message = args.map(String).join(" ");
      return (
        message.startsWith("Warning: Unsupported: field.type of Link") ||
        message.startsWith("Warning: NOT valid form element") ||
        message.startsWith("Warning: TT: undefined function:")
      )
        ? null
        : method(...args);
    };

    console.warn = (...args) => silence(originalWarn, args);
    console.log = (...args) => silence(originalLog, args);

    parser.on("pdfParser_dataError", (error) => {
      console.warn = originalWarn;
      console.log = originalLog;
      reject(error.parserError || error);
    });
    parser.on("pdfParser_dataReady", (pdfData) => {
      console.warn = originalWarn;
      console.log = originalLog;

      const pages = (pdfData.Pages || []).map((page, index) => ({
        pageNumber: index + 1,
        lines: groupTextLines(page.Texts || []),
      }));

      resolve({
        source: {
          title: path.basename(sourcePath, path.extname(sourcePath)),
          fileName: path.basename(sourcePath),
          sourceType: "pdf",
          sourcePath,
        },
        extractedAt: new Date().toISOString(),
        totalPages: pages.length,
        pages,
      });
    });

    parser.loadPDF(sourcePath);
  });
}

export async function loadEnvFromFile() {
  const envPath = path.join(ROOT_DIR, ".env.local");
  try {
    const content = await fs.readFile(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing local env file.
  }
}

export async function getDatabaseUrl() {
  await loadEnvFromFile();
  return process.env.DATABASE_URL;
}

export function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

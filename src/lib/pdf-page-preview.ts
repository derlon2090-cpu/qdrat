import { createRequire } from "node:module";

type CanvasModule = typeof import("@napi-rs/canvas");
type PdfJsNodeModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

type ProcessWithGetBuiltinModule = NodeJS.Process & {
  getBuiltinModule?: (name: string) => unknown;
};

type GlobalCanvasPolyfills = typeof globalThis & {
  DOMMatrix?: typeof DOMMatrix;
  ImageData?: typeof ImageData;
  Path2D?: typeof Path2D;
};

let canvasModulePromise: Promise<CanvasModule> | null = null;
let pdfJsNodeModulePromise: Promise<PdfJsNodeModule> | null = null;
const nodeRequire = createRequire(import.meta.url);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

async function loadCanvasModule() {
  if (!canvasModulePromise) {
    canvasModulePromise = Promise.resolve(nodeRequire("@napi-rs/canvas") as CanvasModule);
  }

  return canvasModulePromise;
}

async function loadPdfJsNodeModule() {
  if (!pdfJsNodeModulePromise) {
    pdfJsNodeModulePromise = (async () => {
      const canvasModule = await loadCanvasModule();
      const globalScope = globalThis as GlobalCanvasPolyfills;
      const currentProcess = process as ProcessWithGetBuiltinModule;

      if (typeof currentProcess.getBuiltinModule !== "function") {
        currentProcess.getBuiltinModule = (name: string) => nodeRequire(name);
      }

      if (!globalScope.DOMMatrix) {
        globalScope.DOMMatrix = canvasModule.DOMMatrix as unknown as typeof DOMMatrix;
      }

      if (!globalScope.ImageData) {
        globalScope.ImageData = canvasModule.ImageData as unknown as typeof ImageData;
      }

      if (!globalScope.Path2D) {
        globalScope.Path2D = canvasModule.Path2D as unknown as typeof Path2D;
      }

      return import("pdfjs-dist/legacy/build/pdf.mjs");
    })();
  }

  return pdfJsNodeModulePromise;
}

export async function renderPdfPagePreviewToPng(input: {
  fileBuffer: Buffer;
  pageNumber: number;
  requestedWidth?: number;
}) {
  const [{ createCanvas }, pdfjs] = await Promise.all([
    loadCanvasModule(),
    loadPdfJsNodeModule(),
  ]);

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(input.fileBuffer),
    disableFontFace: true,
    useSystemFonts: false,
    useWorkerFetch: false,
    useWasm: false,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
  });

  const pdfDocument = await loadingTask.promise;

  try {
    const normalizedPageNumber = clamp(
      Number.isFinite(input.pageNumber) ? Math.round(input.pageNumber) : 1,
      1,
      Math.max(1, pdfDocument.numPages),
    );
    const page = await pdfDocument.getPage(normalizedPageNumber);

    try {
      const viewport = page.getViewport({ scale: 1 });
      const requestedWidth = clamp(
        Number.isFinite(input.requestedWidth ?? NaN) ? Math.round(input.requestedWidth ?? 1800) : 1800,
        900,
        2400,
      );
      const scale = requestedWidth / viewport.width;
      const renderedViewport = page.getViewport({
        scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
      });
      const canvas = createCanvas(
        Math.max(1, Math.ceil(renderedViewport.width)),
        Math.max(1, Math.ceil(renderedViewport.height)),
      );
      const context = canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport: renderedViewport,
      }).promise;

      const buffer = await canvas.encode("png");

      return {
        buffer: Buffer.from(buffer),
        normalizedPageNumber,
        width: canvas.width,
        height: canvas.height,
      };
    } finally {
      page.cleanup();
    }
  } finally {
    await pdfDocument.destroy();
  }
}

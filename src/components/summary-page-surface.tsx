"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Grip, Loader2, Minimize2, Move, SquarePen } from "lucide-react";

import type {
  SummaryDrawingPoint,
  SummaryDrawingStroke,
  SummaryHideRegion,
  SummaryPageDimension,
  SummaryPageState,
  SummarySolutionBox,
} from "@/lib/summaries";
import { cn } from "@/lib/utils";

function getCanvasPixelRatio() {
  const ratio = window.devicePixelRatio || 1;

  if (!Number.isFinite(ratio) || ratio <= 1) {
    return 1;
  }

  return Math.min(2, Math.round(ratio));
}

type ActiveTool = "navigate" | "pen" | "highlighter" | "eraser";

type ChangeMeta = {
  clearRedo?: boolean;
};

type Interaction =
  | {
      kind: "solution-move";
      id: string;
      pointerId: number;
      originX: number;
      originY: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "solution-resize";
      id: string;
      pointerId: number;
      originWidth: number;
      originHeight: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "hide-move";
      id: string;
      pointerId: number;
      originX: number;
      originY: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "hide-resize";
      id: string;
      pointerId: number;
      originWidth: number;
      originHeight: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "draw";
      pointerId: number;
    };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createFrameStyle(x: number, y: number, width: number, height: number) {
  return {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width: `${width * 100}%`,
    height: `${height * 100}%`,
  };
}

function createPointFromEvent(
  event: PointerEvent | ReactPointerEvent,
  surfaceRect: DOMRect,
): SummaryDrawingPoint {
  const x = clamp((event.clientX - surfaceRect.left) / surfaceRect.width, 0, 1);
  const y = clamp((event.clientY - surfaceRect.top) / surfaceRect.height, 0, 1);

  return { x, y };
}

function strokeColorWithOpacity(stroke: SummaryDrawingStroke) {
  if (stroke.color.startsWith("#")) {
    const color = stroke.color.replace("#", "");
    if (color.length === 6) {
      const alpha = Math.round(clamp(stroke.opacity, 0, 1) * 255)
        .toString(16)
        .padStart(2, "0");
      return `#${color}${alpha}`;
    }
  }

  return stroke.color;
}

type SummaryPageSurfaceProps = {
  summaryId: string;
  pageNumber: number;
  pageState: SummaryPageState;
  pageDimension: SummaryPageDimension;
  fileUrl: string;
  hideAnswers: boolean;
  activeTool: ActiveTool;
  strokeColor: string;
  strokeWidth: number;
  onChange: (nextState: SummaryPageState, meta?: ChangeMeta) => void;
};

export function SummaryPageSurface({
  summaryId,
  pageNumber,
  pageState,
  pageDimension,
  fileUrl,
  hideAnswers,
  activeTool,
  strokeColor,
  strokeWidth,
  onChange,
}: SummaryPageSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageStateRef = useRef(pageState);
  const interactionRef = useRef<Interaction | null>(null);
  const previewStrokeRef = useRef<SummaryDrawingStroke | null>(null);
  const [resolvedPageDimension, setResolvedPageDimension] = useState(pageDimension);
  const [isPdfLoading, setIsPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [selectedHideId, setSelectedHideId] = useState<string | null>(null);

  useEffect(() => {
    pageStateRef.current = pageState;
  }, [pageState]);

  useEffect(() => {
    setResolvedPageDimension(pageDimension);
  }, [pageDimension, pageNumber, summaryId]);

  const directPageUrl = useMemo(() => `${fileUrl}?download=1`, [fileUrl]);
  const previewImageUrl = useMemo(
    () => `/api/summaries/${summaryId}/pages/${pageNumber}/preview?width=1800`,
    [pageNumber, summaryId],
  );

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) return;

    const rect = surface.getBoundingClientRect();
    const pixelRatio = getCanvasPixelRatio();
    canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.lineCap = "round";
    context.lineJoin = "round";

    const drawStroke = (stroke: SummaryDrawingStroke) => {
      if (stroke.points.length < 2) return;

      context.save();
      context.strokeStyle = strokeColorWithOpacity(stroke);
      context.lineWidth = stroke.strokeWidth;
      context.globalAlpha = clamp(stroke.opacity, 0.08, 1);

      if (stroke.tool === "highlighter") {
        context.globalCompositeOperation = "multiply";
      }

      context.beginPath();
      stroke.points.forEach((point, index) => {
        const x = point.x * rect.width;
        const y = point.y * rect.height;
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.stroke();
      context.restore();
    };

    pageStateRef.current.drawings.forEach(drawStroke);

    if (previewStrokeRef.current) {
      drawStroke(previewStrokeRef.current);
    }
  }, []);

  /*
  const renderPdfPage = useCallback(
    async (
      documentOverride?: PDFDocumentProxy | null,
      targetPageNumber = 1,
      options?: RenderPdfPageOptions,
    ) => {
      const pdfDocument = documentOverride ?? pdfDocumentRef.current;
      const surface = surfaceRef.current;
      const pdfCanvas = pdfCanvasRef.current;
      const allowFontRecovery = options?.allowFontRecovery ?? true;

      if (!pdfDocument || !surface || !pdfCanvas) {
        return;
      }

      try {
        setIsPdfLoading(true);
        setPdfError(null);

        const page = await pdfDocument.getPage(targetPageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const surfaceWidth = Math.max(1, surface.getBoundingClientRect().width || viewport.width);
        const scale = surfaceWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });
        const outputScale = getCanvasPixelRatio();
        const context = pdfCanvas.getContext("2d");

        if (!context) {
          throw new Error("تعذر تجهيز مساحة عرض الصفحة.");
        }

        setResolvedPageDimension((current) => {
          const nextWidth = Math.max(1, Math.round(viewport.width));
          const nextHeight = Math.max(1, Math.round(viewport.height));

          if (current.width === nextWidth && current.height === nextHeight) {
            return current;
          }

          return {
            width: nextWidth,
            height: nextHeight,
          };
        });

        pdfCanvas.width = Math.max(1, Math.floor(scaledViewport.width * outputScale));
        pdfCanvas.height = Math.max(1, Math.floor(scaledViewport.height * outputScale));
        pdfCanvas.style.width = `${scaledViewport.width}px`;
        pdfCanvas.style.height = `${scaledViewport.height}px`;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);

        renderTaskRef.current?.cancel();
        renderTaskRef.current = page.render({
          canvas: pdfCanvas,
          canvasContext: context,
          viewport: scaledViewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        });

        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
        page.cleanup();

        const fontFaceSet = getDocumentFontFaceSet();
        const renderKey = `${summaryId}:${fileUrl}:${targetPageNumber}`;

        if (
          allowFontRecovery &&
          fontFaceSet &&
          fontFaceSet.status !== "loaded" &&
          fontRecoveryKeyRef.current !== renderKey
        ) {
          fontRecoveryKeyRef.current = renderKey;
          void fontFaceSet.ready
            .then(() => {
              if (fontRecoveryKeyRef.current !== renderKey) {
                return;
              }

              fontRecoveryKeyRef.current = null;

              if (!pdfDocumentRef.current || pageNumberRef.current !== targetPageNumber) {
                return;
              }

              void renderPdfPage(undefined, targetPageNumber, {
                allowFontRecovery: false,
              });
            })
            .catch(() => {
              if (fontRecoveryKeyRef.current === renderKey) {
                fontRecoveryKeyRef.current = null;
              }
            });
        }

        setIsPdfLoading(false);
      } catch (error) {
        const errorName = error instanceof Error ? error.name : "";
        renderTaskRef.current = null;
        if (errorName === "RenderingCancelledException") {
          return;
        }

        setPdfError(formatPdfRenderError(error));
        setIsPdfLoading(false);
      }
    },
    [fileUrl, summaryId],
  );

  useEffect(() => {
    renderCanvas();
  }, [pageState.drawings, renderCanvas]);

  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
      void renderPdfPage(undefined, pageNumber);
    };
    window.addEventListener("resize", handleResize);

    const observer =
      typeof ResizeObserver !== "undefined" && surfaceRef.current
        ? new ResizeObserver(() => {
            renderCanvas();
            void renderPdfPage(undefined, pageNumber);
          })
        : null;

    if (observer && surfaceRef.current) {
      observer.observe(surfaceRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [pageNumber, renderCanvas, renderPdfPage]);

  useEffect(() => {
    let isActive = true;
    const previousDocument = pdfDocumentRef.current;

    fontRecoveryKeyRef.current = null;
    renderTaskRef.current?.cancel();
    renderTaskRef.current = null;
    pdfDocumentRef.current = null;
    void previousDocument?.destroy();
    setIsPdfLoading(true);
    setPdfError(null);

    void (async () => {
      try {
        const [pdfJsModule, pdfData] = await Promise.all([
          loadPdfJsModule(),
          loadSummaryPdfData(fileUrl),
        ]);

        const loadingTask = pdfJsModule.getDocument({
          data: pdfData,
          cMapUrl: "/pdfjs/cmaps/",
          cMapPacked: true,
          standardFontDataUrl: "/pdfjs/standard_fonts/",
          wasmUrl: "/pdfjs/wasm/",
          disableFontFace: false,
          useSystemFonts: true,
          useWorkerFetch: false,
          useWasm: false,
          isOffscreenCanvasSupported: false,
          isImageDecoderSupported: false,
        });
        const pdfDocument = await loadingTask.promise;

        if (!isActive) {
          await pdfDocument.destroy();
          return;
        }

        pdfDocumentRef.current = pdfDocument;
        await renderPdfPage(pdfDocument, pageNumberRef.current);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setPdfError(formatPdfRenderError(error));
        setIsPdfLoading(false);
      }
    })();

    return () => {
      isActive = false;
      fontRecoveryKeyRef.current = null;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;

      const document = pdfDocumentRef.current;
      pdfDocumentRef.current = null;
      void document?.destroy();
    };
  }, [fileUrl, renderPdfPage]);

  useEffect(() => {
    void renderPdfPage(undefined, pageNumber);
  }, [pageNumber, renderPdfPage]);
  */

  useEffect(() => {
    renderCanvas();
  }, [pageState.drawings, renderCanvas]);

  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
    };
    window.addEventListener("resize", handleResize);

    const observer =
      typeof ResizeObserver !== "undefined" && surfaceRef.current
        ? new ResizeObserver(() => {
            renderCanvas();
          })
        : null;

    if (observer && surfaceRef.current) {
      observer.observe(surfaceRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [renderCanvas]);

  useEffect(() => {
    setIsPdfLoading(true);
    setPdfError(null);
  }, [previewImageUrl]);

  const updateSolutionBoxes = useCallback(
    (updater: (boxes: SummarySolutionBox[]) => SummarySolutionBox[]) => {
      const nextState: SummaryPageState = {
        ...pageStateRef.current,
        solutionBoxes: updater(pageStateRef.current.solutionBoxes),
      };
      onChange(nextState);
    },
    [onChange],
  );

  const updateHideRegions = useCallback(
    (updater: (boxes: SummaryHideRegion[]) => SummaryHideRegion[]) => {
      const nextState: SummaryPageState = {
        ...pageStateRef.current,
        hideRegions: updater(pageStateRef.current.hideRegions),
      };
      onChange(nextState);
    },
    [onChange],
  );

  const removeStrokeNearPoint = useCallback(
    (point: SummaryDrawingPoint) => {
      const threshold = 0.03;
      const nextDrawings = pageStateRef.current.drawings.filter(
        (stroke) =>
          !stroke.points.some(
            (strokePoint) =>
              Math.abs(strokePoint.x - point.x) < threshold &&
              Math.abs(strokePoint.y - point.y) < threshold,
          ),
      );

      if (nextDrawings.length !== pageStateRef.current.drawings.length) {
        onChange(
          {
            ...pageStateRef.current,
            drawings: nextDrawings,
          },
          { clearRedo: false },
        );
      }
    },
    [onChange],
  );

  const startDrawing = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (activeTool === "navigate") return;

      const surface = surfaceRef.current;
      if (!surface) return;

      const point = createPointFromEvent(event, surface.getBoundingClientRect());

      if (activeTool === "eraser") {
        removeStrokeNearPoint(point);
        return;
      }

      interactionRef.current = {
        kind: "draw",
        pointerId: event.pointerId,
      };
      previewStrokeRef.current = {
        id: `preview-${Date.now()}`,
        tool: activeTool === "highlighter" ? "highlighter" : "pen",
        color: strokeColor,
        strokeWidth,
        opacity: activeTool === "highlighter" ? 0.24 : 1,
        points: [point, point],
      };

      renderCanvas();
    },
    [activeTool, removeStrokeNearPoint, renderCanvas, strokeColor, strokeWidth],
  );

  const continueDrawing = useCallback(
    (event: PointerEvent | ReactPointerEvent<HTMLCanvasElement>) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.kind !== "draw") return;
      if (interaction.pointerId !== event.pointerId) return;
      if (!surfaceRef.current || !previewStrokeRef.current) return;

      const point = createPointFromEvent(event, surfaceRef.current.getBoundingClientRect());
      previewStrokeRef.current = {
        ...previewStrokeRef.current,
        points: [...previewStrokeRef.current.points, point],
      };
      renderCanvas();
    },
    [renderCanvas],
  );

  const finishDrawing = useCallback(
    (event: PointerEvent | ReactPointerEvent<HTMLCanvasElement>) => {
      const interaction = interactionRef.current;
      if (!interaction || interaction.kind !== "draw") return;
      if (interaction.pointerId !== event.pointerId) return;

      interactionRef.current = null;

      if (previewStrokeRef.current && previewStrokeRef.current.points.length > 1) {
        onChange(
          {
            ...pageStateRef.current,
            drawings: [...pageStateRef.current.drawings, previewStrokeRef.current],
          },
          { clearRedo: true },
        );
      }

      previewStrokeRef.current = null;
      renderCanvas();
    },
    [onChange, renderCanvas],
  );

  const beginSolutionMove = useCallback(
    (id: string, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const box = pageStateRef.current.solutionBoxes.find((item) => item.id === id);
      if (!box || !surfaceRef.current) return;

      const rect = surfaceRef.current.getBoundingClientRect();
      const point = createPointFromEvent(event, rect);

      setSelectedSolutionId(id);
      interactionRef.current = {
        kind: "solution-move",
        id,
        pointerId: event.pointerId,
        originX: box.x,
        originY: box.y,
        startX: point.x,
        startY: point.y,
      };

    },
    [],
  );

  const beginSolutionResize = useCallback(
    (id: string, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const box = pageStateRef.current.solutionBoxes.find((item) => item.id === id);
      if (!box || !surfaceRef.current) return;

      const rect = surfaceRef.current.getBoundingClientRect();
      const point = createPointFromEvent(event, rect);

      setSelectedSolutionId(id);
      interactionRef.current = {
        kind: "solution-resize",
        id,
        pointerId: event.pointerId,
        originWidth: box.width,
        originHeight: box.height,
        startX: point.x,
        startY: point.y,
      };

    },
    [],
  );

  const beginHideMove = useCallback(
    (id: string, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const region = pageStateRef.current.hideRegions.find((item) => item.id === id);
      if (!region || !surfaceRef.current) return;

      const rect = surfaceRef.current.getBoundingClientRect();
      const point = createPointFromEvent(event, rect);

      setSelectedHideId(id);
      interactionRef.current = {
        kind: "hide-move",
        id,
        pointerId: event.pointerId,
        originX: region.x,
        originY: region.y,
        startX: point.x,
        startY: point.y,
      };

    },
    [],
  );

  const beginHideResize = useCallback(
    (id: string, event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const region = pageStateRef.current.hideRegions.find((item) => item.id === id);
      if (!region || !surfaceRef.current) return;

      const rect = surfaceRef.current.getBoundingClientRect();
      const point = createPointFromEvent(event, rect);

      setSelectedHideId(id);
      interactionRef.current = {
        kind: "hide-resize",
        id,
        pointerId: event.pointerId,
        originWidth: region.width,
        originHeight: region.height,
        startX: point.x,
        startY: point.y,
      };

    },
    [],
  );

  const continueBoxInteraction = useCallback(
    (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction || !surfaceRef.current) return;
      if (interaction.kind === "draw") return;
      if (interaction.pointerId !== event.pointerId) return;

      const point = createPointFromEvent(event, surfaceRef.current.getBoundingClientRect());

      if (interaction.kind === "solution-move") {
        const deltaX = point.x - interaction.startX;
        const deltaY = point.y - interaction.startY;
        updateSolutionBoxes((boxes) =>
          boxes.map((box) =>
            box.id === interaction.id
              ? {
                  ...box,
                  x: clamp(interaction.originX + deltaX, 0, 1 - box.width),
                  y: clamp(interaction.originY + deltaY, 0, 1 - box.height),
                }
              : box,
          ),
        );
      }

      if (interaction.kind === "solution-resize") {
        const deltaX = point.x - interaction.startX;
        const deltaY = point.y - interaction.startY;
        updateSolutionBoxes((boxes) =>
          boxes.map((box) =>
            box.id === interaction.id
              ? {
                  ...box,
                  width: clamp(interaction.originWidth + deltaX, 0.14, 1 - box.x),
                  height: clamp(interaction.originHeight + deltaY, 0.12, 1 - box.y),
                }
              : box,
          ),
        );
      }

      if (interaction.kind === "hide-move") {
        const deltaX = point.x - interaction.startX;
        const deltaY = point.y - interaction.startY;
        updateHideRegions((regions) =>
          regions.map((region) =>
            region.id === interaction.id
              ? {
                  ...region,
                  x: clamp(interaction.originX + deltaX, 0, 1 - region.width),
                  y: clamp(interaction.originY + deltaY, 0, 1 - region.height),
                }
              : region,
          ),
        );
      }

      if (interaction.kind === "hide-resize") {
        const deltaX = point.x - interaction.startX;
        const deltaY = point.y - interaction.startY;
        updateHideRegions((regions) =>
          regions.map((region) =>
            region.id === interaction.id
              ? {
                  ...region,
                  width: clamp(interaction.originWidth + deltaX, 0.12, 1 - region.x),
                  height: clamp(interaction.originHeight + deltaY, 0.04, 1 - region.y),
                }
              : region,
          ),
        );
      }
    },
    [updateHideRegions, updateSolutionBoxes],
  );

  const finishBoxInteraction = useCallback((event?: PointerEvent) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.kind === "draw") {
      return;
    }

    if (event && interaction.pointerId !== event.pointerId) {
      return;
    }

    interactionRef.current = null;
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      if (interaction.kind === "draw") {
        continueDrawing(event);
        return;
      }

      continueBoxInteraction(event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      if (interaction.kind === "draw") {
        finishDrawing(event);
        return;
      }

      finishBoxInteraction(event);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      if (interaction.kind === "draw") {
        previewStrokeRef.current = null;
        finishDrawing(event);
        return;
      }

      finishBoxInteraction(event);
    };

    const handleWindowBlur = () => {
      interactionRef.current = null;
      previewStrokeRef.current = null;
      renderCanvas();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [continueBoxInteraction, continueDrawing, finishBoxInteraction, finishDrawing, renderCanvas]);

  return (
    <div className="space-y-4">
      <div
        ref={surfaceRef}
        className="relative mx-auto w-full max-w-[900px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]"
        style={{
          aspectRatio: `${resolvedPageDimension.width} / ${resolvedPageDimension.height}`,
        }}
      >
        <img
          key={previewImageUrl}
          src={previewImageUrl}
          alt={`صفحة ${pageNumber}`}
          className="pointer-events-none absolute inset-0 h-full w-full select-none bg-white object-fill"
          draggable={false}
          onLoad={() => {
            setIsPdfLoading(false);
            setPdfError(null);
          }}
          onError={() => {
            setIsPdfLoading(false);
            setPdfError("تعذر عرض هذه الصفحة الآن. جرّب فتح الصفحة مباشرة أو إعادة تحميل الملخص.");
          }}
        />

        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 z-20 h-full w-full touch-none",
            activeTool === "navigate" ? "pointer-events-none" : "pointer-events-auto",
          )}
          onPointerDown={startDrawing}
        />

        {isPdfLoading ? (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-white/88 text-sm font-semibold text-slate-600 backdrop-blur-[1px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              جارٍ تجهيز الصفحة...
            </span>
          </div>
        ) : null}

        {pdfError ? (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-white/92 px-6 text-center">
            <div className="max-w-md rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-5 text-sm font-semibold leading-7 text-rose-700 shadow-sm">
              {pdfError}
            </div>
          </div>
        ) : null}

        {pageState.hideRegions.map((region) => (
          <div
            key={region.id}
            className={cn(
              "absolute z-30 overflow-hidden rounded-2xl border shadow-sm transition",
              hideAnswers
                ? "border-slate-300 bg-white"
                : "border-dashed border-slate-300/90 bg-white/40 backdrop-blur-sm",
              selectedHideId === region.id && "ring-2 ring-[#123B7A]/20",
            )}
            style={createFrameStyle(region.x, region.y, region.width, region.height)}
          >
            {hideAnswers ? (
              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-slate-500">
                إخفاء الإجابة
              </div>
            ) : null}

            <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
              <button
                type="button"
                className="rounded-full bg-white/85 p-1 text-slate-600 shadow"
                onPointerDown={(event) => beginHideMove(region.id, event)}
                aria-label="تحريك مربع الإخفاء"
              >
                <Move className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="rounded-full bg-white/85 p-1 text-slate-600 shadow"
                onPointerDown={(event) => beginHideResize(region.id, event)}
                aria-label="تغيير حجم مربع الإخفاء"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {pageState.solutionBoxes.map((box) => (
          <div
            key={box.id}
            className={cn(
              "absolute z-40 overflow-hidden rounded-[1.4rem] border border-[#d8c7a7] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,245,232,0.97))] shadow-[0_12px_32px_rgba(201,154,67,0.18)]",
              selectedSolutionId === box.id && "ring-2 ring-[#C99A43]/25",
            )}
            style={createFrameStyle(box.x, box.y, box.width, box.height)}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#eadcc0] bg-white/85 px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <SquarePen className="h-3.5 w-3.5 text-[#C99A43]" />
                مساحة حل
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-slate-600 shadow"
                  onPointerDown={(event) => beginSolutionMove(box.id, event)}
                  aria-label="تحريك مساحة الحل"
                >
                  <Grip className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-slate-600 shadow"
                  onPointerDown={(event) => beginSolutionResize(box.id, event)}
                  aria-label="تغيير حجم مساحة الحل"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={box.content}
              onChange={(event) =>
                updateSolutionBoxes((boxes) =>
                  boxes.map((item) =>
                    item.id === box.id
                      ? { ...item, content: event.target.value }
                      : item,
                  ),
                )
              }
              className="h-[calc(100%-42px)] w-full resize-none border-0 bg-[repeating-linear-gradient(180deg,transparent,transparent_30px,rgba(15,23,42,0.08)_30px,rgba(15,23,42,0.08)_31px)] px-4 py-3 text-sm leading-8 text-slate-800 outline-none"
              placeholder="اكتب حلك هنا..."
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <a
          href={directPageUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#123B7A]/20 hover:text-[#123B7A]"
        >
          تنزيل الملف الأصلي
        </a>
      </div>
    </div>
  );
}

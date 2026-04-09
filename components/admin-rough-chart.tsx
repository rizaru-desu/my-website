"use client";

import { useEffect, useId, useMemo, useRef } from "react";

type RoughChartType = "Bar" | "BarH" | "Donut" | "Line";

type BarLikeData = {
  labels: string[];
  values: number[];
};

type LineData = {
  points: Array<{
    x: string;
    y: number;
  }>;
  seriesLabel?: string;
};

type AdminRoughChartProps = {
  type: RoughChartType;
  data: BarLikeData | LineData;
  height?: number;
  colors?: string[];
  xLabel?: string;
  yLabel?: string;
};

type RoughVizModule = {
  Bar: new (options: Record<string, unknown>) => {
    remove?: () => void;
    responsive?: boolean;
  };
  BarH: new (options: Record<string, unknown>) => {
    remove?: () => void;
    responsive?: boolean;
  };
  Donut: new (options: Record<string, unknown>) => {
    remove?: () => void;
    responsive?: boolean;
  };
  Line: new (options: Record<string, unknown>) => {
    remove?: () => void;
    responsive?: boolean;
  };
};

export function AdminRoughChart({
  type,
  data,
  height = 300,
  colors,
  xLabel,
  yLabel,
}: AdminRoughChartProps) {
  const reactId = useId();
  const containerId = `rough-chart-${reactId.replace(/[:]/g, "")}`;
  const chartInstanceRef = useRef<{
    remove?: () => void;
    responsive?: boolean;
  } | null>(null);
  const isZeroOnlyLine = useMemo(() => {
    if (type !== "Line") {
      return false;
    }

    const lineData = data as LineData;

    if (!lineData.points?.length) {
      return false;
    }

    return lineData.points.every((point) => point.y === 0);
  }, [data, type]);
  const normalized = useMemo(() => {
    if (type === "Line") {
      const lineData = data as LineData;

      if (!lineData.points?.length) {
        return null;
      }

      const labels = lineData.points.map((point) => point.x);
      const values = lineData.points.map((point) => point.y);

      if (
        values.some((value) => typeof value !== "number" || Number.isNaN(value))
      ) {
        return null;
      }

      if (values.every((value) => value === 0)) {
        return null;
      }

      return {
        chartData: {
          [lineData.seriesLabel ?? "Series"]: values,
        },
        labels,
      };
    }

    const barLikeData = data as BarLikeData;

    if (
      !barLikeData.labels?.length ||
      !barLikeData.values?.length ||
      barLikeData.labels.length !== barLikeData.values.length ||
      barLikeData.values.some(
        (value) => typeof value !== "number" || Number.isNaN(value),
      )
    ) {
      return null;
    }

    return {
      chartData: barLikeData,
      labels: barLikeData.labels,
    };
  }, [data, type]);
  const linePreviewLabels = useMemo(() => {
    if (type !== "Line" || !normalized?.labels?.length) {
      return [];
    }

    if (normalized.labels.length <= 10) {
      return normalized.labels;
    }

    const step = Math.max(1, Math.ceil((normalized.labels.length - 1) / 5));

    return normalized.labels.filter(
      (_, index) =>
        index === 0 ||
        index === normalized.labels.length - 1 ||
        index % step === 0,
    );
  }, [normalized, type]);

  useEffect(() => {
    if (!normalized) {
      return;
    }

    let cancelled = false;
    let frameId = 0;

    async function renderChart() {
      const container = document.getElementById(containerId);

      if (!container) {
        return;
      }

      container.innerHTML = "";

      const roughVizImport = (await import("rough-viz")) as unknown as
        | RoughVizModule
        | { default: RoughVizModule };
      const roughViz =
        "default" in roughVizImport ? roughVizImport.default : roughVizImport;

      if (cancelled) {
        return;
      }

      const ChartConstructor = roughViz[type];

      if (!ChartConstructor) {
        return;
      }

      chartInstanceRef.current?.remove?.();
      chartInstanceRef.current = new ChartConstructor({
        element: `#${containerId}`,
        data: normalized?.chartData,
        legend: false,
        interactive: false,
        width: Math.max(container.clientWidth, 320),
        height,
        color: colors?.[0] ?? "#2463eb",
        colors: colors ?? ["#2463eb", "#ef3b2d", "#f7d20a", "#111111"],
        stroke: "#111111",
        strokeWidth: 2.2,
        axisStrokeWidth: 1.2,
        axisRoughness: 0.8,
        roughness: 0.9,
        bowing: 0.8,
        fillStyle: type === "Donut" ? "zigzag" : "cross-hatch",
        fillWeight: 1.6,
        circle: type === "Line",
        circleRadius: 8,
        margin:
          type === "BarH"
            ? { top: 24, right: 24, bottom: 36, left: 156 }
            : type === "Donut"
              ? { top: 12, right: 12, bottom: 12, left: 12 }
              : { top: 24, right: 24, bottom: 58, left: 92 },
        axisFontSize: "0.64rem",
        labelFontSize: "0.78rem",
        tooltipFontSize: "0.75rem",
        xLabel: "",
        yLabel: "",
      });

      const svg = container.querySelector("svg");
      if (svg instanceof SVGElement) {
        svg.style.width = "100%";
        svg.style.height = "100%";
      }
    }

    frameId = window.requestAnimationFrame(() => {
      renderChart();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      if (chartInstanceRef.current) {
        // rough-viz leaves a bound resize listener behind, so disable
        // responsiveness before removing the instance to prevent redraws
        // against a detached DOM node.
        chartInstanceRef.current.responsive = false;
        chartInstanceRef.current.remove?.();
        chartInstanceRef.current = null;
      }

      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [colors, containerId, height, normalized, type, xLabel, yLabel]);

  if (!normalized) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-[22px] border-[3px] border-dashed border-ink bg-white/70 px-6 text-center shadow-[5px_5px_0_var(--ink)]">
        <p className="max-w-sm text-sm font-semibold uppercase tracking-[0.16em] text-ink/58">
          {isZeroOnlyLine
            ? "Trend will appear after the first tracked visitors are recorded."
            : "No chart data available for this panel yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div id={containerId} className="w-full" style={{ height }} />
      {type === "Line" ? (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${linePreviewLabels.length}, minmax(0, 1fr))`,
          }}
        >
          {linePreviewLabels.map((label) => (
            <div
              key={label}
              className="rounded-[14px] border-[2px] border-ink bg-panel px-2 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink/62"
            >
              {label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

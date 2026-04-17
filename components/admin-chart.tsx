"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartType = "Bar" | "BarH" | "Donut" | "Line";

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

type AdminChartProps = {
  type: ChartType;
  data: BarLikeData | LineData;
  height?: number;
  colors?: string[];
  xLabel?: string;
  yLabel?: string;
};

type TooltipValue = number | string;

const defaultColors = ["#2463eb", "#ef3b2d", "#f7d20a", "#111111"];

function ChartEmptyState({ children, height }: { children: ReactNode; height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[22px] border-[3px] border-dashed border-ink bg-white/70 px-6 text-center shadow-[5px_5px_0_var(--ink)]"
      style={{ height }}
    >
      <p className="max-w-sm text-sm font-semibold uppercase tracking-[0.16em] text-ink/58">
        {children}
      </p>
    </div>
  );
}

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{
    color?: string;
    name?: string;
    value?: TooltipValue;
  }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[18px] border-[3px] border-ink bg-white px-3 py-3 shadow-[4px_4px_0_var(--ink)]">
      {label ? (
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink/55">
          {label}
        </p>
      ) : null}
      <div className="mt-2 space-y-2">
        {payload.map((item) => (
          <div key={`${item.name}-${item.value}`} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full border border-ink/20"
              style={{ backgroundColor: item.color ?? defaultColors[0] }}
            />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/65">
              {item.name}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeBarLikeData(data: BarLikeData, colors: string[]) {
  if (
    !data.labels?.length ||
    !data.values?.length ||
    data.labels.length !== data.values.length ||
    data.values.some((value) => typeof value !== "number" || Number.isNaN(value))
  ) {
    return null;
  }

  return data.labels.map((label, index) => ({
    color: colors[index % colors.length] ?? defaultColors[0],
    label,
    value: data.values[index] ?? 0,
  }));
}

export function AdminChart({
  type,
  data,
  height = 300,
  colors = defaultColors,
  xLabel,
  yLabel,
}: AdminChartProps) {
  const normalizedLineData = useMemo(() => {
    if (type !== "Line") {
      return null;
    }

    const lineData = data as LineData;

    if (!lineData.points?.length) {
      return null;
    }

    if (
      lineData.points.some(
        (point) => typeof point.y !== "number" || Number.isNaN(point.y),
      )
    ) {
      return null;
    }

    if (lineData.points.every((point) => point.y === 0)) {
      return [];
    }

    return lineData.points.map((point) => ({
      label: point.x,
      value: point.y,
    }));
  }, [data, type]);

  const normalizedBarData = useMemo(() => {
    if (type === "Line") {
      return null;
    }

    return normalizeBarLikeData(data as BarLikeData, colors);
  }, [colors, data, type]);

  if (type === "Line") {
    if (normalizedLineData === null) {
      return (
        <ChartEmptyState height={height}>
          No chart data available for this panel yet.
        </ChartEmptyState>
      );
    }

    if (normalizedLineData.length === 0) {
      return (
        <ChartEmptyState height={height}>
          Trend will appear after the first tracked visitors are recorded.
        </ChartEmptyState>
      );
    }

    const lineColor = colors[0] ?? defaultColors[0];

    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={normalizedLineData}
            margin={{ top: 12, right: 8, bottom: 4, left: -18 }}
          >
            <CartesianGrid stroke="#111111" strokeDasharray="4 8" strokeOpacity={0.18} />
            <XAxis
              axisLine={false}
              dataKey="label"
              minTickGap={20}
              tick={{ fill: "#6d6a67", fontSize: 11, fontWeight: 700 }}
              tickLine={false}
              label={
                xLabel
                  ? {
                      fill: "#6d6a67",
                      fontSize: 11,
                      fontWeight: 700,
                      offset: -2,
                      position: "insideBottom",
                      value: xLabel,
                    }
                  : undefined
              }
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: "#6d6a67", fontSize: 11, fontWeight: 700 }}
              tickLine={false}
              width={34}
              label={
                yLabel
                  ? {
                      angle: -90,
                      dx: -8,
                      fill: "#6d6a67",
                      fontSize: 11,
                      fontWeight: 700,
                      position: "insideLeft",
                      value: yLabel,
                    }
                  : undefined
              }
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#111111", strokeOpacity: 0.12 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, r: 4, stroke: "#111111", strokeWidth: 1.5 }}
              activeDot={{ r: 6, stroke: "#111111", strokeWidth: 2, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (!normalizedBarData || normalizedBarData.length === 0) {
    return (
      <ChartEmptyState height={height}>
        No chart data available for this panel yet.
      </ChartEmptyState>
    );
  }

  if (type === "Donut") {
    const total = normalizedBarData.reduce((sum, item) => sum + item.value, 0);

    if (total <= 0) {
      return (
        <ChartEmptyState height={height}>
          No chart data available for this panel yet.
        </ChartEmptyState>
      );
    }

    return (
      <div className="space-y-4">
        <div className="w-full" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={normalizedBarData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={3}
                cornerRadius={8}
                stroke="#111111"
                strokeWidth={2}
              >
                {normalizedBarData.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {normalizedBarData.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-[16px] border-[2px] border-ink bg-white/70 px-3 py-2 shadow-[3px_3px_0_var(--ink)]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border border-ink/25"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/65">
                  {item.label}
                </span>
              </div>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "BarH") {
    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={normalizedBarData}
            layout="vertical"
            margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
          >
            <CartesianGrid horizontal={false} stroke="#111111" strokeDasharray="4 8" strokeOpacity={0.15} />
            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tick={{ fill: "#6d6a67", fontSize: 11, fontWeight: 700 }}
              tickLine={false}
              label={
                xLabel
                  ? {
                      fill: "#6d6a67",
                      fontSize: 11,
                      fontWeight: 700,
                      offset: -4,
                      position: "insideBottom",
                      value: xLabel,
                    }
                  : undefined
              }
            />
            <YAxis
              dataKey="label"
              type="category"
              axisLine={false}
              tick={{ fill: "#6d6a67", fontSize: 11, fontWeight: 700 }}
              tickLine={false}
              width={88}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(17,17,17,0.05)" }} />
            <Bar dataKey="value" radius={[10, 10, 10, 10]} maxBarSize={28}>
              {normalizedBarData.map((entry) => (
                <Cell key={entry.label} fill={entry.color} stroke="#111111" strokeWidth={1.2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={normalizedBarData} margin={{ top: 8, right: 12, bottom: 8, left: -14 }}>
          <CartesianGrid stroke="#111111" strokeDasharray="4 8" strokeOpacity={0.15} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tick={{ fill: "#6d6a67", fontSize: 11, fontWeight: 700 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#6d6a67", fontSize: 11, fontWeight: 700 }}
            tickLine={false}
            width={34}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(17,17,17,0.05)" }} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={42}>
            {normalizedBarData.map((entry) => (
              <Cell key={entry.label} fill={entry.color} stroke="#111111" strokeWidth={1.2} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

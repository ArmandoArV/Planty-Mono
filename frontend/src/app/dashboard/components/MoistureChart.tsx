"use client";

import { Card, Text } from "@fluentui/react-components";
import { DataLineRegular } from "@fluentui/react-icons";

interface MoistureChartProps {
  history: { time: string; moisture: number }[];
}

export default function MoistureChart({ history }: MoistureChartProps) {
  const maxVal = 100;
  const chartHeight = 160;

  return (
    <Card className="border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <DataLineRegular className="text-xl text-accent" />
        <Text weight="semibold" size={400}>
          Moisture History
        </Text>
        <Text size={200} className="ml-auto text-muted">
          Last 60 min
        </Text>
      </div>

      <div className="relative w-full" style={{ height: chartHeight }}>
        {/* Horizontal guide lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <div
            key={v}
            className="absolute left-8 right-0 border-t border-dashed border-border"
            style={{ bottom: `${(v / maxVal) * 100}%` }}
          >
            <span className="absolute -left-8 -top-2 text-[10px] text-muted">
              {v}%
            </span>
          </div>
        ))}

        {/* SVG line chart */}
        <svg
          viewBox={`0 0 ${history.length * 60} ${chartHeight}`}
          className="absolute inset-0 ml-8 h-full w-[calc(100%-2rem)]"
          preserveAspectRatio="none"
        >
          {/* Area fill */}
          <polygon
            points={`0,${chartHeight} ${history
              .map(
                (d, i) =>
                  `${i * (history.length > 1 ? (history.length * 60 - 60) / (history.length - 1) : 0)},${chartHeight - (d.moisture / maxVal) * chartHeight}`,
              )
              .join(" ")} ${(history.length - 1) * ((history.length * 60 - 60) / Math.max(history.length - 1, 1))},${chartHeight}`}
            fill="url(#areaGrad)"
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            points={history
              .map(
                (d, i) =>
                  `${i * (history.length > 1 ? (history.length * 60 - 60) / (history.length - 1) : 0)},${chartHeight - (d.moisture / maxVal) * chartHeight}`,
              )
              .join(" ")}
          />

          {/* Data dots */}
          {history.map((d, i) => (
            <circle
              key={i}
              cx={i * (history.length > 1 ? (history.length * 60 - 60) / (history.length - 1) : 0)}
              cy={chartHeight - (d.moisture / maxVal) * chartHeight}
              r="4"
              fill="#16a34a"
              stroke="#fff"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          <defs>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="ml-8 mt-2 flex justify-between">
        {history
          .filter((_, i) => i % 3 === 0 || i === history.length - 1)
          .map((d, i) => (
            <Text key={i} size={100} className="text-muted">
              {d.time}
            </Text>
          ))}
      </div>
    </Card>
  );
}

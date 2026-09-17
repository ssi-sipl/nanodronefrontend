"use client";

const TICKS = Array.from({ length: 12 }, (_, i) => i * 30); // every 30°
const CARDINALS: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "W" };

interface CompassRingProps {
  size: number;
  bearingDeg: number; // 0 = N, 90 = E, 180 = S, 270 = W
  active: boolean;
}

export function CompassRing({ size, bearingDeg, active }: CompassRingProps) {
  const radius = size / 2;
  const tickOuter = radius;
  const tickInner = radius - 10;
  const degreeLabelRadius = radius - 22;
  const cardinalLabelRadius = radius + 14; // outside the ring, so it doesn't crowd the degree numbers

  const toXY = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180; // 0deg = up (N)
    return { x: radius + r * Math.cos(rad), y: radius + r * Math.sin(rad) };
  };

  return (
    <svg
      width={size + 32}
      height={size + 32}
      viewBox={`${-16} ${-16} ${size + 32} ${size + 32}`}
      className="absolute pointer-events-none"
      style={{ top: -16, left: -16, overflow: "visible" }}
    >
      <circle cx={radius} cy={radius} r={radius} fill="none" stroke="#475569" strokeWidth={1.5} />

      {TICKS.map((deg) => {
        const outer = toXY(deg, tickOuter);
        const inner = toXY(deg, tickInner);
        const isCardinal = deg % 90 === 0;
        return (
          <line
            key={`tick-${deg}`}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke={isCardinal ? "#e2e8f0" : "#64748b"}
            strokeWidth={isCardinal ? 2 : 1}
          />
        );
      })}

      {TICKS.map((deg) => {
        const pos = toXY(deg, degreeLabelRadius);
        return (
          <text
            key={`deg-${deg}`}
            x={pos.x}
            y={pos.y}
            fill="#94a3b8"
            fontSize={10}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {deg}
          </text>
        );
      })}

      {Object.entries(CARDINALS).map(([deg, label]) => {
        const pos = toXY(Number(deg), cardinalLabelRadius);
        return (
          <text
            key={`cardinal-${label}`}
            x={pos.x}
            y={pos.y}
            fill="#e2e8f0"
            fontSize={13}
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {label}
          </text>
        );
      })}

      {active && (
        <line
          x1={radius}
          y1={radius}
          x2={toXY(bearingDeg, radius - 12).x}
          y2={toXY(bearingDeg, radius - 12).y}
          stroke="#38bdf8"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
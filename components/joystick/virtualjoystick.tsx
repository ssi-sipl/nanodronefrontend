"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VirtualJoystickProps {
  size?: number;
  knobSize?: number;
  label?: string;
  axis?: "both" | "x" | "y"; // constrain movement to one axis (for yaw/Altitude-style sticks)
  onChange: (x: number, y: number) => void; // normalized -1..1, y negative = up
  disabled?: boolean;
}

export function VirtualJoystick({
  size = 140,
  knobSize = 36,
  label,
  axis = "both",
  onChange,
  disabled,
}: VirtualJoystickProps) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const maxRadius = (size - knobSize) / 2;

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      if (!base) return;

      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;

      if (axis === "x") dy = 0;
      if (axis === "y") dx = 0;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxRadius) {
        const scale = maxRadius / dist;
        dx *= scale;
        dy *= scale;
      }

      setPos({ x: dx, y: dy });
      onChange(dx / maxRadius, dy / maxRadius);
    },
    [axis, maxRadius, onChange]
  );

  const resetKnob = useCallback(() => {
    draggingRef.current = false;
    setPos({ x: 0, y: 0 });
    onChange(0, 0);
  }, [onChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = () => resetKnob();

  useEffect(() => {
    window.addEventListener("blur", resetKnob);
    return () => window.removeEventListener("blur", resetKnob);
  }, [resetKnob]);

  const trackClass =
    axis === "x"
      ? "rounded-full h-10"
      : axis === "y"
        ? "rounded-full w-10"
        : "rounded-full";

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: axis === "y" ? knobSize + 20 : size,
          height: axis === "x" ? knobSize + 20 : size,
        }}
        className={`relative bg-slate-700/60 border-2 border-slate-600 ${trackClass} ${
          disabled ? "opacity-40" : ""
        }`}
      >
        <div
          style={{
            width: knobSize,
            height: knobSize,
            transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          }}
          className="absolute top-1/2 left-1/2 rounded-full bg-slate-100 shadow-md transition-transform duration-75 ease-out"
        />
      </div>
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
    </div>
  );
}
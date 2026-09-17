"use client";

import { useCallback, useEffect, useRef } from "react";

interface AltitudeLeverProps {
  width?: number;
  height?: number;
  value: number; // 0..1
  onChange: (value: number) => void;
}

export function AltitudeLever({ width = 40, height = 144, value, onChange }: AltitudeLeverProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const updateFromPointer = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      // Bottom of track = 0, top of track = 1
      const ratio = 1 - (clientY - rect.top) / rect.height;
      const clamped = Math.min(1, Math.max(0, ratio));
      onChange(Math.round(clamped * 100) / 100);
    },
    [onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromPointer(e.clientY);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
    // Altitude lever holds its position on release (real throttle behavior) — no reset here.
  };

  useEffect(() => {
    const handleBlur = () => {
      draggingRef.current = false;
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  const fillHeight = value * height;

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ width, height, touchAction: "none" }}
      className="relative rounded-full bg-black border border-slate-600 overflow-hidden cursor-pointer select-none"
    >
      {/* Fill grows from the bottom, black at 0 -> white at 1 */}
      <div
        style={{ height: fillHeight }}
        className="absolute bottom-0 left-0 right-0 bg-white transition-[height] duration-75 ease-out"
      />
      {/* Thumb marker */}
      <div
        style={{ bottom: `calc(${fillHeight}px - 10px)` }}
        className="absolute left-1/2 -translate-x-1/2 w-7 h-5 rounded-md bg-slate-200 border border-slate-400 shadow-md"
      />
    </div>
  );
}
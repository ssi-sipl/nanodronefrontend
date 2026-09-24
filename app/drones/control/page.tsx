"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DroneDropdown } from "@/components/drone-dropdown";
import { VirtualJoystick } from "@/components/joystick/virtualjoystick";
import { CompassRing } from "@/components/joystick/CompassRing";
import { AltitudeLever } from "@/components/joystick/AltitudeLever";
import { Button } from "@/components/ui/button";
import { CameraFeedPlayer } from "@/components/camera/CameraFeedPlayer";
import { baseUrl } from "@/lib/config";
import { useElementSize } from "@/hooks/use-element-size";
import { DropPayloadConfirmDialog } from "@/components/drone/DropPayloadConfirmDialog";
import { Wifi, WifiOff, Home, Package, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SEND_INTERVAL_MS = 200;
const MAX_ALTITUDE_METERS = 100;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function JoystickControlInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(
    searchParams.get("droneId")
  );
  const [areaId, setAreaId] = useState("");
  const [usbAddress, setUsbAddress] = useState("");
  const [cameraFeed, setCameraFeed] = useState("");
  const [loadingDroneInfo, setLoadingDroneInfo] = useState(false);
  const [dropConfirmOpen, setDropConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchDroneInfo = async () => {
      if (!selectedDroneId) {
        setAreaId("");
        setUsbAddress("");
        setCameraFeed("");
        return;
      }
      try {
        setLoadingDroneInfo(true);
        const res = await fetch(`${baseUrl}/drones/drone/${selectedDroneId}`);
        const data = await res.json();
        console.log(data);
        if (!res.ok) throw new Error(data.message);
        setAreaId(data.data.area_id || "");
        setUsbAddress(data.data.usbaddress || "");
        setCameraFeed(data.data.cameraFeed || "");
      } catch {
        setAreaId("");
        setUsbAddress("");
        setCameraFeed("");
      } finally {
        setLoadingDroneInfo(false);
      }
    };
    fetchDroneInfo();
  }, [selectedDroneId]);

  useEffect(() => {
    const url = selectedDroneId ? `/drones/control?droneId=${selectedDroneId}` : "/drones/control";
    router.replace(url, { scroll: false });
  }, [selectedDroneId, router]);

  const altitudeRef = useRef(0);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const rollRef = useRef(0);

  const [altitudeUi, setAltitudeUi] = useState(0);
  const [yawUi, setYawUi] = useState(0);
  const [pitchUi, setPitchUi] = useState(0);
  const [rollUi, setRollUi] = useState(0);

  const [connected, setConnected] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const wasActiveRef = useRef(false);

  const sendControl = useCallback(async () => {
    if (!selectedDroneId || !areaId) return;

    const altitude = altitudeRef.current;
    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    const roll = rollRef.current;

    const active = altitude !== 0 || yaw !== 0 || pitch !== 0 || roll !== 0;
    if (!active && !wasActiveRef.current) return;

    try {
      const res = await fetch(`${baseUrl}/drones/joystick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drone_id: selectedDroneId, area_id: areaId, altitude, yaw, pitch, roll }),
      });
      setConnected(res.ok);
    } catch {
      setConnected(false);
    }

    wasActiveRef.current = active;
  }, [selectedDroneId, areaId]);

  useEffect(() => {
    const interval = setInterval(sendControl, SEND_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [sendControl]);

  useEffect(() => {
    yawRef.current = 0;
    pitchRef.current = 0;
    rollRef.current = 0;
    setYawUi(0);
    setPitchUi(0);
    setRollUi(0);
  }, [selectedDroneId]);

  const handleQuickAction = async (key: string, endpoint: string, extraBody: Record<string, unknown> = {}) => {
    if (!selectedDroneId) return;
    setPending(key);
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drone_id: selectedDroneId, area_id: areaId, ...extraBody }),
      });
      const data = await res.json();
      alert(data.message);
    } catch {
      alert("Command failed. Check connection.");
    } finally {
      setPending(null);
    }
  };

  const bearingDeg = ((Math.atan2(rollUi, pitchUi) * 180) / Math.PI + 360) % 360;
  const stickActive = Math.abs(pitchUi) > 0.05 || Math.abs(rollUi) > 0.05;

  const { ref: controlsRef, size: controlsSize } = useElementSize<HTMLDivElement>();

  const sizes = useMemo(() => {
    const w = controlsSize.width || 320;
    const h = controlsSize.height || 300;
    const base = Math.min(w, h);

    const stick = clamp(base * 0.42, 90, 200);
    const yawStick = clamp(base * 0.28, 60, 130);
    const stickKnob = clamp(stick * 0.22, 20, 44);
    const yawKnob = clamp(yawStick * 0.24, 16, 32);
    const leverHeight = clamp(base * 0.32, 60, 120);

    return { stick, yawStick, stickKnob, yawKnob, leverHeight };
  }, [controlsSize]);

  const handleDropConfirm = async (pin: string) => {
    const res = await fetch(`${baseUrl}/drones/dropPayload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drone_id: selectedDroneId, area_id: areaId, pin }),
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      throw new Error(data.message || "Failed to drop payload.");
    }
    alert(data.message);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-900 text-white grid grid-rows-[auto_1fr] overflow-hidden">
      {/* Header row — always in normal flow, never overlaps content below it */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-1 border-b border-slate-800 bg-slate-900 z-10">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8 sm:h-10 sm:w-10"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
          )}
          <DroneDropdown selectedDroneId={selectedDroneId} setSelectedDroneId={setSelectedDroneId} variant="compact" />
        </div>
      </div>

      {/* Content row: fills remaining space exactly, splits into video + controls */}
      <div className="grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-1 md:grid-cols-2 min-h-0 min-w-0">
        {/* Video panel */}
        <div className="min-h-0 min-w-0 flex items-center justify-center bg-black overflow-hidden">
          {!selectedDroneId ? (
            <p className="text-slate-500 text-xs sm:text-sm px-4 text-center">Select a drone to begin.</p>
          ) : loadingDroneInfo ? (
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-slate-500" />
          ) : cameraFeed ? (
            <CameraFeedPlayer pathName={selectedDroneId} className="w-full h-full !aspect-auto !rounded-none !border-0" />
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 px-4 text-center">
              No camera feed configured for this drone.
            </p>
          )}
        </div>

        {/* Controls + telemetry */}
        <div
          ref={controlsRef}
          className="min-h-0 min-w-0 flex flex-col border-t md:border-t-0 md:border-l border-slate-800 overflow-y-auto"
        >
          {/* Joystick section */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 sm:gap-4 px-3 py-2">
            {selectedDroneId ? (
              <>
                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] sm:text-[11px] text-slate-500">Altitude</span>
                      <AltitudeLever
                        height={sizes.leverHeight}
                        value={altitudeUi}
                        onChange={(v) => {
                          altitudeRef.current = v;
                          setAltitudeUi(v);
                        }}
                      />
                      <span className="text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                        {(altitudeUi * MAX_ALTITUDE_METERS).toFixed(1)} m
                      </span>
                    </div>
                    <VirtualJoystick
                      axis="x"
                      size={sizes.yawStick}
                      knobSize={sizes.yawKnob}
                      label="Yaw"
                      onChange={(x) => {
                        yawRef.current = x;
                        setYawUi(x);
                      }}
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                      {yawUi >= 0 ? "+" : ""}
                      {Math.round(yawUi * 100)}%
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-2 m-2">
                    <div className="relative" style={{ width: sizes.stick, height: sizes.stick }}>
                      <CompassRing size={sizes.stick} bearingDeg={bearingDeg} active={stickActive} />
                      <VirtualJoystick
                        size={sizes.stick}
                        knobSize={sizes.stickKnob}
                        onChange={(x, y) => {
                          rollRef.current = x;
                          pitchRef.current = -y;
                          setRollUi(x);
                          setPitchUi(-y);
                        }}
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-medium text-slate-400 mt-4">Pitch / Roll</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 tabular-nums">
                      {stickActive ? `${Math.round(bearingDeg)}\u00b0` : "\u2014"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 bg-slate-800 border-slate-600 text-white hover:bg-amber-900/40 hover:border-amber-500 text-xs sm:text-sm"
                    disabled={pending !== null}
                    onClick={() => handleQuickAction("rtl", "/drones/rtl", { usb_address: usbAddress })}
                  >
                    {pending === "rtl" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Home className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    RTL
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 bg-slate-800 border-slate-600 text-white hover:bg-green-900/40 hover:border-green-500 text-xs sm:text-sm"
                    onClick={() => setDropConfirmOpen(true)}
                  >
                    <Package className="w-3.5 h-3.5 text-green-400" />
                    Drop Payload
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-xs sm:text-sm">Select a drone above.</p>
            )}
          </div>

          {/* Telemetry — left blank for now */}
          <div className="border-t border-slate-800 flex items-center justify-center py-4 shrink-0">
            <p className="text-slate-600 text-xs sm:text-sm">Telemetry (coming soon)</p>
          </div>
        </div>
      </div>
      <DropPayloadConfirmDialog
        open={dropConfirmOpen}
        onOpenChange={setDropConfirmOpen}
        onConfirm={handleDropConfirm}
      />
    </div>

  );
}

export default function JoystickControlPage() {
  return (
    <Suspense fallback={null}>
      <JoystickControlInner />
    </Suspense>
  );
}
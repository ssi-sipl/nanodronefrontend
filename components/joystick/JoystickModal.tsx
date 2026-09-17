"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VirtualJoystick } from "./virtualjoystick";
import { CompassRing } from "./CompassRing";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CameraFeedPlayer } from "@/components/camera/CameraFeedPlayer";
import { baseUrl } from "@/lib/config";
import { Wifi, WifiOff, Home, Package, Loader2 } from "lucide-react";

const SEND_INTERVAL_MS = 200;
const STICK_SIZE = 200;

interface JoystickModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  droneId: string | null;
  areaId: string;
  usbAddress: string;
  hasCameraFeed?: boolean;
}

export function JoystickModal({
  open,
  onOpenChange,
  droneId,
  areaId,
  usbAddress,
  hasCameraFeed,
}: JoystickModalProps) {
  const AltitudeRef = useRef(0); // -1..1, non-spring, stays where set
  const yawRef = useRef(0);      // -1..1, spring-loaded (x-axis only)
  const pitchRef = useRef(0);    // -1..1, spring-loaded
  const rollRef = useRef(0);     // -1..1, spring-loaded

  const [AltitudeUi, setAltitudeUi] = useState(0);
  const [yawUi, setYawUi] = useState(0);
  const [pitchUi, setPitchUi] = useState(0);
  const [rollUi, setRollUi] = useState(0);

  const [connected, setConnected] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const wasActiveRef = useRef(false);

  const sendControl = useCallback(async () => {
    if (!droneId || !areaId) return;

    const Altitude = AltitudeRef.current;
    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    const roll = rollRef.current;

    const active = Altitude !== 0 || yaw !== 0 || pitch !== 0 || roll !== 0;
    if (!active && !wasActiveRef.current) return;

    try {
      const res = await fetch(`${baseUrl}/drones/joystick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drone_id: droneId, area_id: areaId, Altitude, yaw, pitch, roll }),
      });
      setConnected(res.ok);
    } catch {
      setConnected(false);
    }

    wasActiveRef.current = active;
  }, [droneId, areaId]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(sendControl, SEND_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      AltitudeRef.current = 0;
      yawRef.current = 0;
      pitchRef.current = 0;
      rollRef.current = 0;
      setAltitudeUi(0);
      setYawUi(0);
      setPitchUi(0);
      setRollUi(0);
      sendControl(); // final neutral packet on close
    };
  }, [open, sendControl]);

  const handleQuickAction = async (key: string, endpoint: string, extraBody: Record<string, unknown> = {}) => {
    if (!droneId) return;
    setPending(key);
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drone_id: droneId, area_id: areaId, ...extraBody }),
      });
      const data = await res.json();
      alert(data.message);
    } catch {
      alert("Command failed. Check connection.");
    } finally {
      setPending(null);
    }
  };

  // Bearing for the compass ring: 0deg = N (pitch forward), 90deg = E (roll right)
const bearingDeg = ((Math.atan2(rollUi, pitchUi) * 180) / Math.PI + 360) % 360;
const stickActive = Math.abs(pitchUi) > 0.05 || Math.abs(rollUi) > 0.05;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-gradient-to-b from-slate-900 to-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            Joystick Control
            {connected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {droneId ? `Drone: ${droneId}` : "No drone selected"}
          </DialogDescription>
        </DialogHeader>

        {droneId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* LEFT: video feed */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-slate-400">Live Feed</span>
              {hasCameraFeed ? (
                <CameraFeedPlayer pathName={droneId} />
              ) : (
                <div className="w-full aspect-video rounded-lg border border-slate-700 bg-slate-800/60 flex items-center justify-center text-sm text-slate-500">
                  No camera feed configured for this drone.
                </div>
              )}
            </div>

            {/* RIGHT: controls */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-center gap-8">
                {/* Altitude (vertical, non-spring) + Yaw (horizontal, spring-loaded) */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] text-slate-500">Altitude</span>
                      <div className="h-28 flex items-center">
                        <Slider
                          orientation="vertical"
                          min={0}
                          max={1}
                          step={0.05}
                          value={[AltitudeUi]}
                          onValueChange={([v]) => {
                            AltitudeRef.current = v;
                            setAltitudeUi(v);
                          }}
                          className="h-28"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {AltitudeUi >= 0 ? "+" : ""}
                        {Math.round(AltitudeUi * 100)}%
                      </span>
                    </div>
                  </div>
                  <VirtualJoystick
                    axis="x"
                    size={120}
                    knobSize={30}
                    label="Yaw"
                    onChange={(x) => {
                      yawRef.current = x;
                      setYawUi(x);
                    }}
                  />
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {yawUi >= 0 ? "+" : ""}
                    {Math.round(yawUi * 100)}%
                  </span>
                </div>

                {/* Pitch/Roll with compass ring */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative" style={{ width: STICK_SIZE, height: STICK_SIZE }}>
                    <CompassRing size={STICK_SIZE} bearingDeg={bearingDeg} active={stickActive} />
                    <VirtualJoystick
                      size={STICK_SIZE}
                      knobSize={30}
                      onChange={(x, y) => {
                        rollRef.current = x;
                        pitchRef.current = -y; // up on stick = positive pitch (forward)
                        setRollUi(x);
                        setPitchUi(-y);
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Pitch / Roll</span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {stickActive ? `${Math.round(bearingDeg)}\u00b0` : "\u2014"}
                  </span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-slate-800 border-slate-600 text-white hover:bg-amber-900/40 hover:border-amber-500"
                  disabled={pending !== null}
                  onClick={() => handleQuickAction("rtl", "/drones/rtl", { usb_address: usbAddress })}
                >
                  {pending === "rtl" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Home className="w-4 h-4 text-amber-400" />
                  )}
                  RTL
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-slate-800 border-slate-600 text-white hover:bg-green-900/40 hover:border-green-500"
                  disabled={pending !== null}
                  onClick={() => handleQuickAction("drop", "/drones/dropPayload")}
                >
                  {pending === "drop" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Package className="w-4 h-4 text-green-400" />
                  )}
                  Drop Payload
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 py-8">Select a drone on the dashboard first.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
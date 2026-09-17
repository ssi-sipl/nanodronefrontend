"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DroneDropdown } from "@/components/drone-dropdown";
import { VirtualJoystick } from "@/components/joystick/virtualjoystick";
import { CompassRing } from "@/components/joystick/CompassRing";
import { AltitudeLever } from "@/components/joystick/AltitudeLever";
import { Button } from "@/components/ui/button";
import { CameraFeedPlayer } from "@/components/camera/CameraFeedPlayer";
import { baseUrl } from "@/lib/config";
import { Wifi, WifiOff, Home, Package, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SEND_INTERVAL_MS = 200;
const STICK_SIZE = 180;
const MAX_ALTITUDE_METERS = 100;

function JoystickControlInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [selectedDroneId, setSelectedDroneId] = useState<string | null>(
        searchParams.get("droneId")
    );
    const [areaId, setAreaId] = useState("");
    const [usb_address, setusb_address] = useState("");
    const [cameraFeed, setCameraFeed] = useState("");
    const [loadingDroneInfo, setLoadingDroneInfo] = useState(false);
    const [droneName, setDroneName] = useState("");

    useEffect(() => {
        const fetchDroneInfo = async () => {
            if (!selectedDroneId) {
                setAreaId("");
                setusb_address("");
                setCameraFeed("");
                setDroneName("");
                return;
            }
            try {
                setLoadingDroneInfo(true);
                const res = await fetch(`${baseUrl}/drones/drone/${selectedDroneId}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setAreaId(data.data.area_id || "");
                setusb_address(data.data.usbaddress || "");
                setCameraFeed(data.data.cameraFeed || "");
                setDroneName(data.data.name || "");
            } catch {
                setAreaId("");
                setusb_address("");
                setCameraFeed("");
                setDroneName("");
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

    return (
        <div className="fixed inset-0 w-screen h-screen bg-slate-900 text-white flex overflow-hidden">
            {/* Top bar overlay: back button (left) + drone dropdown (right) */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2 py-2 pointer-events-none">
                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="pointer-events-auto text-slate-300 hover:text-black hover:bg-slate-500"
                >
                    <Link href="/">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>

                <div className="pointer-events-auto flex items-center gap-2">
                    {connected ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm font-semibold text-white">
                        {droneName || "Select Drone"}
                    </span>
                    <div className="w-4">
                        <DroneDropdown selectedDroneId={selectedDroneId} setSelectedDroneId={setSelectedDroneId} />
                    </div>
                </div>
            </div>

            {/* LEFT 50%: video feed */}
            <div className="w-1/2 h-full flex items-center justify-center bg-black">
                {!selectedDroneId ? (
                    <p className="text-slate-500 text-sm">Select a drone to begin.</p>
                ) : loadingDroneInfo ? (
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                ) : cameraFeed ? (
                    <CameraFeedPlayer pathName={selectedDroneId} className="w-full h-full !aspect-auto !rounded-none !border-0" />
                ) : (
                    <p className="text-sm text-slate-500">No camera feed configured for this drone.</p>
                )}
            </div>

            {/* RIGHT 50%: joystick (60%) + telemetry (40%) */}
            <div className="w-1/2 h-full flex flex-col border-l border-slate-800">
                {/* Joystick section — 60% */}
                <div className="h-[60%] flex flex-col items-center justify-center gap-6 px-4">
                    {selectedDroneId ? (
                        <>
                            <div className="flex items-center justify-center gap-10">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[11px] text-slate-500">Altitude</span>
                                        <AltitudeLever
                                            height={100}
                                            value={altitudeUi}
                                            onChange={(v) => {
                                                altitudeRef.current = v;
                                                setAltitudeUi(v);
                                            }}
                                        />
                                        <span className="text-[11px] text-slate-400 tabular-nums">
                                            {(altitudeUi * MAX_ALTITUDE_METERS).toFixed(1)} m
                                        </span>
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

                                <div className="flex flex-col items-center gap-2 m-4">
                                    <div className="relative" style={{ width: STICK_SIZE, height: STICK_SIZE }}>
                                        <CompassRing size={STICK_SIZE} bearingDeg={bearingDeg} active={stickActive} />
                                        <VirtualJoystick
                                            size={STICK_SIZE}
                                            knobSize={40}
                                            onChange={(x, y) => {
                                                rollRef.current = x;
                                                pitchRef.current = -y;
                                                setRollUi(x);
                                                setPitchUi(-y);
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 mt-4">Pitch / Roll</span>
                                    <span className="text-[11px] text-slate-400 tabular-nums">
                                        {stickActive ? `${Math.round(bearingDeg)}\u00b0` : "\u2014"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 bg-slate-800 border-slate-600 text-white hover:bg-amber-900/40 hover:border-amber-500"
                                    disabled={pending !== null}
                                    onClick={() =>
                                        handleQuickAction("rtl", "/drones/rtl", { usb_address: usb_address })
                                    }>
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
                        </>
                    ) : (
                        <p className="text-slate-500 text-sm">Select a drone above.</p>
                    )}
                </div>

                {/* Telemetry section — 40%, left blank for now */}
                <div className="h-[40%] border-t border-slate-800 flex items-center justify-center">
                    <p className="text-slate-600 text-sm">Telemetry (coming soon)</p>
                </div>
            </div>
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
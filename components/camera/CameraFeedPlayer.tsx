"use client";

import { useEffect, useRef, useState } from "react";
import { getWhepEndpoint } from "@/lib/mediamtx";
import { Loader2, Maximize2, Play, RefreshCw, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraFeedPlayerProps {
  pathName: string;     // drone_id or sensor_id used as the MediaMTX path
  label?: string;
  className?: string;
  autoConnect?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onExpand?: () => void;
}

export function CameraFeedPlayer({
  pathName,
  label,
  className,
  autoConnect = true,
  onStart,
  onStop,
  onExpand,
}: CameraFeedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState<"connecting" | "playing" | "error">("connecting");
  const [reloadKey, setReloadKey] = useState(0);
  const [startedLocally, setStartedLocally] = useState(false);
  const shouldConnect = autoConnect || startedLocally;

  useEffect(() => {
    if (!shouldConnect) return;

    let cancelled = false;

    async function connect() {
      setStatus("connecting");
      cleanup();

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setStatus("playing");
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          if (!cancelled) setStatus("error");
        }
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE gathering to complete (simplest non-trickle WHEP flow)
        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === "complete") return resolve();
          const check = () => {
            if (pc.iceGatheringState === "complete") {
              pc.removeEventListener("icegatheringstatechange", check);
              resolve();
            }
          };
          pc.addEventListener("icegatheringstatechange", check);
        });

        const res = await fetch(getWhepEndpoint(pathName), {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: pc.localDescription?.sdp,
        });

        if (!res.ok) throw new Error(`WHEP request failed: ${res.status}`);

        const answerSdp = await res.text();
        if (cancelled) return;
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
      } catch (err) {
        console.error(`Camera feed error (${pathName}):`, err);
        if (!cancelled) setStatus("error");
      }
    }

    function cleanup() {
      pcRef.current?.close();
      pcRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    connect();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [pathName, reloadKey, shouldConnect]);

  return (
    <div className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden border ${className ?? ""}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {label && (
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {label}
        </div>
      )}

      {!shouldConnect && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-sm text-white">
          <VideoOff className="h-6 w-6" />
          <span>Feed is stopped</span>
          <Button
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setStartedLocally(true);
              onStart?.();
            }}
          >
            <Play className="mr-1 h-3 w-3" /> Start live feed
          </Button>
        </div>
      )}

      {shouldConnect && status === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
        </div>
      )}

      {shouldConnect && status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-sm gap-2">
          <VideoOff className="w-6 h-6" />
          <span>Feed unavailable</span>
          <Button
            size="sm"
            variant="outline"
            className="text-black"
            onClick={(event) => {
              event.stopPropagation();
              setReloadKey((k) => k + 1);
            }}
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </div>
      )}

      {shouldConnect && onStop && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute bottom-2 right-2"
          onClick={(event) => {
            event.stopPropagation();
            setStartedLocally(false);
            onStop();
          }}
        >
          Stop live feed
        </Button>
      )}

      {onExpand && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-2 left-2"
          onClick={(event) => {
            event.stopPropagation();
            onExpand();
          }}
        >
          <Maximize2 className="mr-1 h-3 w-3" /> Zoom
        </Button>
      )}
    </div>
  );
}

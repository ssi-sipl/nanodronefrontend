"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DroneDropdown } from "@/components/drone-dropdown";
import { LiveVideoFeed } from "@/components/live-video-feed";
import { baseUrl } from "@/lib/config";

type StreamRecord = {
  drone_id?: string;
  sensor_id?: string;
  cameraFeed?: string | null;
};

function LiveStreamsContent() {
  const searchParams = useSearchParams();
  const requestedStream = searchParams.get("stream");
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(requestedStream);
  const [rtspUrl, setRtspUrl] = useState<string>();

  useEffect(() => {
    const streamId = requestedStream || selectedDroneId;
    if (!streamId) {
      setRtspUrl(undefined);
      return;
    }

    Promise.all([
      fetch(`${baseUrl}/drones`).then((response) => response.json()),
      fetch(`${baseUrl}/sensors`).then((response) => response.json()),
    ])
      .then(([droneResponse, sensorResponse]) => {
        const records: StreamRecord[] = [
          ...(droneResponse.data || []),
          ...(sensorResponse.data || []),
        ];
        const record = records.find(
          (item) => item.drone_id === streamId || item.sensor_id === streamId
        );
        setRtspUrl(record?.cameraFeed || undefined);
      })
      .catch(() => setRtspUrl(undefined));
  }, [requestedStream, selectedDroneId]);

  if (requestedStream) {
    return (
      <main className="min-h-screen">
        <LiveVideoFeed streamId={requestedStream} rtspUrl={rtspUrl} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">Live streams</h1>
        <p className="text-sm text-muted-foreground">Choose a drone to view its live RTSP feed.</p>
      </div>

      <div className="max-w-sm rounded-lg border bg-card p-4 shadow-sm">
        <label className="text-sm font-medium" htmlFor="live-stream-drone">Drone</label>
        <div id="live-stream-drone">
          <DroneDropdown
            selectedDroneId={selectedDroneId}
            setSelectedDroneId={setSelectedDroneId}
          />
        </div>
      </div>

      <LiveVideoFeed streamId={selectedDroneId ?? undefined} rtspUrl={rtspUrl} />
    </main>
  );
}

export default function LiveStreamsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <LiveStreamsContent />
    </Suspense>
  );
}

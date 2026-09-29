"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CameraFeedGrid } from "@/components/camera/CameraFeedGrid";
import { Button } from "@/components/ui/button";
import { getDrones, getSensors, type Drone, type Sensor } from "@/lib/api";

type FeedItem = {
  pathName: string;
  label: string;
  hasFeed: boolean;
};

function hasCameraFeed(record: Drone | Sensor) {
  const cameraFeed = record.cameraFeed?.trim();
  return Boolean(cameraFeed?.startsWith("rtsp://") && !cameraFeed.includes("<"));
}

export default function LiveViewPage() {
  const searchParams = useSearchParams();
  const requestedStream = searchParams.get("stream");
  const [drones, setDrones] = useState<Drone[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFeeds = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [droneList, sensorList] = await Promise.all([getDrones(), getSensors()]);
      setDrones(droneList);
      setSensors(sensorList);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load camera feeds.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeeds();
  }, [loadFeeds]);

  const feedItems = useMemo<FeedItem[]>(() => {
    const droneFeeds = drones
      .filter(hasCameraFeed)
      .map((drone) => ({
        pathName: drone.drone_id,
        label: `Drone: ${drone.name}`,
        hasFeed: true,
      }));
    const sensorFeeds = sensors
      .filter(hasCameraFeed)
      .map((sensor) => ({
        pathName: sensor.sensor_id,
        label: `Sensor: ${sensor.name}`,
        hasFeed: true,
      }));

    const feeds = [...droneFeeds, ...sensorFeeds];
    return requestedStream ? feeds.filter((feed) => feed.pathName === requestedStream) : feeds;
  }, [drones, requestedStream, sensors]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live streams</h1>
          <p className="text-sm text-muted-foreground">
            {requestedStream
              ? `Viewing stream ${requestedStream}`
              : "Live camera feeds from configured drones and sensors."}
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadFeeds()} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh feeds"}
        </Button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </div>
      ) : isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading camera feeds...</div>
      ) : (
        <CameraFeedGrid items={feedItems} />
      )}
    </main>
  );
}

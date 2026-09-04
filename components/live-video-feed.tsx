"use client";

import { useMemo } from "react";
import { CircleAlert, Radio, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LiveVideoFeedProps = {
  streamId?: string;
  rtspUrl?: string;
};

function getMediaMtxUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_MEDIA_MTX_URL?.replace(/\/$/, "");

  if (configuredUrl) return configuredUrl;
  if (typeof window === "undefined") return "";

  return `${window.location.protocol}//${window.location.hostname}:8889`;
}

export function LiveVideoFeed({ streamId, rtspUrl }: LiveVideoFeedProps) {
  const streamUrl = useMemo(() => {
    if (!streamId || !rtspUrl) return "";
    return `${getMediaMtxUrl()}/${encodeURIComponent(streamId)}`;
  }, [streamId, rtspUrl]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-slate-950 py-4 text-white">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-5 w-5" />
          Live video
        </CardTitle>
        <span className="flex items-center gap-2 text-xs text-slate-300">
          <Radio className="h-3.5 w-3.5 text-red-400" />
          {streamId ? `Stream: ${streamId}` : "Awaiting selection"}
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {streamUrl ? (
          <iframe
            key={streamUrl}
            title={`Live video feed for ${streamId}`}
            src={streamUrl}
            className="aspect-video w-full border-0 bg-black"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-slate-300">
            <Video className="h-10 w-10 text-slate-500" />
            <p className="font-medium">No RTSP feed is configured for this source.</p>
            <p className="text-sm text-slate-500">Add its RTSP URL while creating or editing the drone/sensor, then configure the matching MediaMTX stream.</p>
          </div>
        )}
      </CardContent>
      <div className="flex items-start gap-2 border-t bg-amber-50 px-4 py-3 text-xs text-amber-900">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Set <code>NEXT_PUBLIC_MEDIA_MTX_URL</code> to the MediaMTX WebRTC address (for example, <code>http://drone-gateway:8889</code>). MediaMTX converts the drone RTSP stream into browser playback.</span>
      </div>
    </Card>
  );
}

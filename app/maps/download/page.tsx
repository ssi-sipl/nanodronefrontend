"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2, Eye } from "lucide-react";

type OfflineMap = {
  id: string;
  name: string;
  description: string | null;
  north: number;
  south: number;
  east: number;
  west: number;
  minZoom: number;
  maxZoom: number;
  totalTiles: number;
  downloadedTiles: number;
  failedTiles: number;
  status: string;
  createdAt: string;
};

const emptyForm = {
  name: "",
  description: "",
  north: "",
  south: "",
  east: "",
  west: "",
  minZoom: "12",
  maxZoom: "16",
};

export default function OfflineMapsPage() {
  const [form, setForm] = useState(emptyForm);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<{ downloaded: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maps, setMaps] = useState<OfflineMap[]>([]);
  const [loadingMaps, setLoadingMaps] = useState(true);

  const loadMaps = useCallback(async () => {
    try {
      setLoadingMaps(true);
      const res = await fetch("/api/offline-map", { cache: "no-store" });
      const data = await res.json();
      if (data.status) setMaps(data.data || []);
    } catch {
      toast.error("Failed to load downloaded maps");
    } finally {
      setLoadingMaps(false);
    }
  }, []);

  useEffect(() => {
    loadMaps();
  }, [loadMaps]);

  const handleDownload = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setProgress(null);
    setDownloading(true);

    try {
      const res = await fetch("/api/offline-map/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          north: Number(form.north),
          south: Number(form.south),
          east: Number(form.east),
          west: Number(form.west),
          minZoom: Number(form.minZoom),
          maxZoom: Number(form.maxZoom),
        }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setError(data.message || "Failed to start download.");
        setDownloading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Streaming is not supported by this browser.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);

          if (event.type === "progress") {
            setProgress({ downloaded: event.downloaded, failed: event.failed, total: event.total });
          } else if (event.type === "error") {
            setError(event.message);
          } else if (event.type === "done") {
            toast.success(`Map downloaded: ${event.downloaded} tiles saved${event.failed ? `, ${event.failed} failed` : ""}.`);
            setForm(emptyForm);
            loadMaps();
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/offline-map/delete/${id}`, { method: "POST" });
      const data = await res.json();
      if (!data.status) throw new Error(data.message);
      toast.success("Map deleted");
      loadMaps();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete map");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <Toaster position="top-right" />
      <h1 className="text-xl md:text-2xl font-bold text-center">Offline Maps</h1>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle>Download a New Offline Map</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDownload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="map-name">Location Name</Label>
                <Input
                  id="map-name"
                  placeholder="e.g. Jodhpur Sector 12"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={downloading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="map-desc">Details</Label>
                <Input
                  id="map-desc"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={downloading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="north">North (lat)</Label>
                <Input
                  id="north"
                  type="number"
                  step="any"
                  value={form.north}
                  onChange={(e) => setForm({ ...form, north: e.target.value })}
                  required
                  disabled={downloading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="south">South (lat)</Label>
                <Input
                  id="south"
                  type="number"
                  step="any"
                  value={form.south}
                  onChange={(e) => setForm({ ...form, south: e.target.value })}
                  required
                  disabled={downloading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="east">East (long)</Label>
                <Input
                  id="east"
                  type="number"
                  step="any"
                  value={form.east}
                  onChange={(e) => setForm({ ...form, east: e.target.value })}
                  required
                  disabled={downloading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="west">West (long)</Label>
                <Input
                  id="west"
                  type="number"
                  step="any"
                  value={form.west}
                  onChange={(e) => setForm({ ...form, west: e.target.value })}
                  required
                  disabled={downloading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-zoom">Min Zoom</Label>
                <Input
                  id="min-zoom"
                  type="number"
                  min={1}
                  max={19}
                  value={form.minZoom}
                  onChange={(e) => setForm({ ...form, minZoom: e.target.value })}
                  required
                  disabled={downloading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-zoom">Max Zoom</Label>
                <Input
                  id="max-zoom"
                  type="number"
                  min={1}
                  max={19}
                  value={form.maxZoom}
                  onChange={(e) => setForm({ ...form, maxZoom: e.target.value })}
                  required
                  disabled={downloading}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {progress && (
              <div className="space-y-2">
                <Progress value={(progress.downloaded / progress.total) * 100} />
                <p className="text-sm text-muted-foreground text-center">
                  {progress.downloaded + progress.failed} / {progress.total} tiles
                  {progress.failed > 0 && ` (${progress.failed} failed)`}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={downloading}>
              {downloading ? "Downloading..." : "Download Map"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Downloaded Maps</h2>
        {loadingMaps ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : maps.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No offline maps downloaded yet.</p>
        ) : (
          <div className="space-y-3">
            {maps.map((map) => (
              <Card key={map.id} className="bg-blue-100 border-blue-200">
                <CardContent className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{map.name}</p>
                    {map.description && (
                      <p className="text-sm text-muted-foreground">{map.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      N {map.north.toFixed(4)}, S {map.south.toFixed(4)}, E {map.east.toFixed(4)}, W {map.west.toFixed(4)}
                      {" \u2022 "}Zoom {map.minZoom}\u2013{map.maxZoom}
                      {" \u2022 "}{map.downloadedTiles}/{map.totalTiles} tiles
                      {" \u2022 "}
                      <span
                        className={
                          map.status === "completed"
                            ? "text-green-600"
                            : map.status === "failed"
                              ? "text-destructive"
                              : "text-yellow-600"
                        }
                      >
                        {map.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/maps/view/${map.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(map.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
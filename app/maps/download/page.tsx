"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    status: string; // "downloading" | "completed" | "cancelled" | "failed"
    isActive: boolean;
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

const POLL_INTERVAL_MS = 1500;

export default function OfflineMapsPage() {
    const [form, setForm] = useState(emptyForm);
    const [downloading, setDownloading] = useState(false);
    const [progress, setProgress] = useState<{ downloaded: number; failed: number; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [maps, setMaps] = useState<OfflineMap[]>([]);
    const [loadingMaps, setLoadingMaps] = useState(true);
    const [currentMapId, setCurrentMapId] = useState<string | null>(null);
    const [isPausedUi, setIsPausedUi] = useState(false);

    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    const loadMaps = useCallback(async () => {
        try {
            setLoadingMaps(true);
            const res = await fetch("/api/offline-maps", { cache: "no-store" });
            const data = await res.json();
            if (data.status) {
                const all: OfflineMap[] = data.data || [];
                setMaps(all.filter((m) => m.status !== "downloading" && m.status !== "paused"));
                return all;
            }
        } catch {
            toast.error("Failed to load downloaded maps");
        } finally {
            setLoadingMaps(false);
        }
        return [];
    }, []);

    const pollMap = useCallback(
        (mapId: string) => {
            stopPolling();
            setCurrentMapId(mapId);
            setDownloading(true);

            pollIntervalRef.current = setInterval(async () => {
                try {
                    const res = await fetch(`/api/offline-maps/${mapId}`, { cache: "no-store" });
                    const data = await res.json();
                    if (!data.status || !data.data) return;

                    const map: OfflineMap = data.data;
                    setProgress({ downloaded: map.downloadedTiles, failed: map.failedTiles, total: map.totalTiles });
                    setIsPausedUi(map.status === "paused");
                    if (map.status !== "downloading" && map.status !== "paused") {
                        stopPolling();
                        setDownloading(false);
                        setCurrentMapId(null);
                        setIsPausedUi(false);

                        if (map.status === "completed") {
                            toast.success(`Map downloaded: ${map.downloadedTiles} tiles saved${map.failedTiles ? `, ${map.failedTiles} failed` : ""}.`);
                            setForm(emptyForm);
                        } else if (map.status === "cancelled") {
                            toast(`Download cancelled (${map.downloadedTiles} tiles saved before stopping).`);
                        } else if (map.status === "failed") {
                            toast.error("Download failed.");
                        }

                        loadMaps();
                    }
                } catch {

                }
            }, POLL_INTERVAL_MS);
        },
        [loadMaps, stopPolling]
    );

    useEffect(() => {
        (async () => {
            const all = await loadMaps();
            const active = all.find((m) => m.status === "downloading" || m.status === "paused");
            if (active) {
                pollMap(active.id);
            }
        })();

        return () => stopPolling();
    }, [loadMaps, pollMap, stopPolling]);

    const handleDownload = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setProgress(null);
        setIsPausedUi(false);

        try {
            const res = await fetch("/api/offline-maps/download", {
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

            const data = await res.json();

            if (!res.ok || !data.status) {
                setError(data.message || "Failed to start download.");
                return;
            }
            pollMap(data.data.mapId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        }
    };

    const handlePauseResume = async () => {
        if (!currentMapId) return;
        const endpoint = isPausedUi ? "resume" : "pause";
        try {
            const res = await fetch(`/api/offline-maps/${endpoint}/${currentMapId}`, { method: "POST" });
            const data = await res.json();
            if (!data.status) throw new Error(data.message);
            setIsPausedUi(endpoint === "pause");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : `Failed to ${endpoint} download`);
        }
    };

    const handleCancel = async () => {
        if (!currentMapId) return;
        const mapId = currentMapId;

        try {
            const res = await fetch(`/api/offline-maps/cancel/${mapId}`, {
                method: "POST",
            });
            const data = await res.json();
            if (!data.status) {
                throw new Error(data.message);
            }

            stopPolling();
            setDownloading(false);
            setCurrentMapId(null);
            setIsPausedUi(false);
            setProgress(null);
            setError(null);

            setForm(emptyForm);

            await loadMaps();

            toast.success("Download cancelled and map deleted");
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to cancel download"
            );
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/offline-maps/delete/${id}`, { method: "POST" });
            const data = await res.json();
            if (!data.status) throw new Error(data.message);
            toast.success("Map deleted");
            loadMaps();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete map");
        }
    };

    const handleSetActive = async (id: string) => {
        try {
            const res = await fetch(`/api/offline-maps/activate/${id}`, { method: "POST" });
            const data = await res.json();
            if (!data.status) throw new Error(data.message);
            toast.success(data.message);
            loadMaps();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to set active map");
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

                        {downloading && (
                            <div className="space-y-2">
                                <Progress value={progress ? ((progress.downloaded + progress.failed) / progress.total) * 100 : 0} />
                                <p className="text-sm text-muted-foreground text-center">
                                    {!progress
                                        ? "Starting download\u2026"
                                        : `${isPausedUi ? "Paused" : "Downloading..."} ${Math.round(
                                            ((progress.downloaded + progress.failed) / progress.total) * 100
                                        )}%${progress.failed > 0 ? ` (${progress.failed} failed)` : ""}`}
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handlePauseResume}
                                        disabled={!currentMapId}
                                    >
                                        {isPausedUi ? "Resume" : "Pause"}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleCancel}
                                        disabled={!currentMapId}
                                    >
                                        Cancel
                                    </Button>
                                </div>
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
                            <Card
                                key={map.id}
                                className={map.isActive ? "bg-blue-100 border-blue-400 border-2" : "bg-blue-100 border-blue-200"}
                            >
                                <CardContent className="py-4 flex items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{map.name}</p>
                                            {map.isActive && (
                                                <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        {map.description && (
                                            <p className="text-sm text-muted-foreground">{map.description}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            N {map.north.toFixed(4)}, S {map.south.toFixed(4)}, E {map.east.toFixed(4)}, W {map.west.toFixed(4)}
                                            {" \u2022 "}Zoom {map.minZoom}\{map.maxZoom}
                                            {" \u2022 "}{map.downloadedTiles}/{map.totalTiles} tiles
                                            {" \u2022 "}
                                            <span
                                                className={
                                                    map.status === "completed"
                                                        ? "text-green-600"
                                                        : map.status === "failed"
                                                            ? "text-destructive"
                                                            : map.status === "cancelled"
                                                                ? "text-slate-500"
                                                                : "text-yellow-600"
                                                }
                                            >
                                                {map.status}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0 items-stretch">
                                        {map.status === "completed" && (
                                            <Button
                                                size="sm"
                                                variant={map.isActive ? "secondary" : "outline"}
                                                onClick={() => handleSetActive(map.id)}
                                                disabled={map.isActive}
                                            >
                                                {map.isActive ? "Active" : "Set Active"}
                                            </Button>
                                        )}
                                        <div className="flex gap-2">
                                            <Button asChild size="sm" variant="outline" className="flex-1">
                                                <Link href={`/maps/view/${map.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={() => handleDelete(map.id)}
                                                disabled={map.isActive}
                                                title={map.isActive ? "Deactivate before deleting" : "Delete this map"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
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
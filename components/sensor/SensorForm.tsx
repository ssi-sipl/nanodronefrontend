"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSensor,
  getAreas,
  getSensor,
  updateSensor,
  type Area,
  type SensorPayload,
} from "@/lib/api";
import { CameraFeedPlayer } from "@/components/camera/CameraFeedPlayer";

type SensorFormProps = {
  mode: "create" | "edit";
  sensorId?: string;
};

const emptyForm: SensorPayload = {
  name: "",
  sensor_id: "",
  area_id: "",
  latitude: 0,
  longitude: 0,
  cameraFeed: "",
};

export function SensorForm({ mode, sensorId }: SensorFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<SensorPayload>(emptyForm);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const isCreateMode = mode === "create";

  useEffect(() => {
    async function loadFormData() {
      try {
        if (mode === "edit") {
          setLoading(true);
        }

        const [areaList, sensor] = await Promise.all([
          getAreas(),
          mode === "edit" && sensorId ? getSensor(sensorId) : Promise.resolve(null),
        ]);
        setAreas(areaList);

        if (mode === "edit") {
          if (!sensor) {
            toast.error("Sensor not found");
            return;
          }
          setForm({
            name: sensor.name,
            sensor_id: sensor.sensor_id,
            area_id: sensor.area_id,
            latitude: sensor.latitude,
            longitude: sensor.longitude,
            cameraFeed: sensor.cameraFeed ?? "",
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load form data");
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, [mode, sensorId]);

  useEffect(() => {
    router.prefetch("/sensors");
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response =
        mode === "edit" && sensorId
          ? await updateSensor(sensorId, form)
          : await createSensor(form);

      toast.success(response.message || "Sensor saved successfully");
      router.push("/sensors");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save sensor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-xl md:text-2xl font-bold text-center">
        {mode === "edit" ? "Edit Sensor" : "Create Sensor"}
      </h1>

      <Card className="border-none shadow-none px-0 ml-0">
        <CardContent className="py-6 border-none shadow-none px-0 ml-0">
          {loading ? (
            <div className="text-center py-8">Loading sensor...</div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={
                isCreateMode
                  ? "mx-auto flex w-full max-w-md flex-col gap-5"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] items-end gap-4 md:gap-6"
              }
            >
              <div className="w-full space-y-2">
                <Label htmlFor="sensor-name" className="text-sm font-semibold text-gray-700">
                  Name
                </Label>
                <Input
                  id="sensor-name"
                  placeholder="Sensor Name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="sensor-id" className="text-sm font-semibold text-gray-700">
                  Sensor ID
                </Label>
                <Input
                  id="sensor-id"
                  placeholder="Sensor ID"
                  value={form.sensor_id}
                  onChange={(event) =>
                    setForm({ ...form, sensor_id: event.target.value })
                  }
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="sensor-area" className="text-sm font-semibold text-gray-700">
                  Area
                </Label>
                <Select
                  value={form.area_id}
                  onValueChange={(value) => setForm({ ...form, area_id: value })}
                >
                  <SelectTrigger id="sensor-area" className="h-10 w-full">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.length > 0 ? (
                      areas.map((area) => (
                        <SelectItem key={area.area_id} value={area.area_id}>
                          {area.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No areas available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full space-y-2">
                <Label
                  htmlFor="sensor-latitude"
                  className="text-sm font-semibold text-gray-700"
                >
                  Latitude
                </Label>
                <Input
                  id="sensor-latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={form.latitude === 0 ? "" : form.latitude}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      latitude: Number.parseFloat(event.target.value) || 0,
                    })
                  }
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="w-full space-y-2">
                <Label
                  htmlFor="sensor-longitude"
                  className="text-sm font-semibold text-gray-700"
                >
                  Longitude
                </Label>
                <Input
                  id="sensor-longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={form.longitude === 0 ? "" : form.longitude}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      longitude: Number.parseFloat(event.target.value) || 0,
                    })
                  }
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="w-full space-y-2 lg:col-span-5">
                <Label
                  htmlFor="sensor-camera"
                  className="text-sm font-semibold text-gray-700"
                >
                  Camera Feed (RTSP URL)
                </Label>
                <Input
                  id="sensor-camera"
                  placeholder="rtsp://user:pass@ip:554/stream"
                  value={form.cameraFeed ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, cameraFeed: event.target.value })
                  }
                  className="h-10 w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className={`bg-black text-white hover:bg-gray-800 h-10 w-full ${
                  isCreateMode ? "" : "lg:w-auto"
                }`}
              >
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save Sensor"
                    : "Create Sensor"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {mode === "edit" && !loading && form.cameraFeed && form.sensor_id && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Live Preview</h2>
          <CameraFeedPlayer pathName={form.sensor_id} label={form.name} />
        </div>
      )}
    </div>
  );
}
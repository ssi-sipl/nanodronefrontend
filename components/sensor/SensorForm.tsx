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
};

export function SensorForm({ mode, sensorId }: SensorFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<SensorPayload>(emptyForm);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true);
        setAreas(await getAreas());

        if (mode === "edit" && sensorId) {
          const sensor = await getSensor(sensorId);
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
      router.refresh();
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] items-end gap-4 md:gap-6"
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
              <Button
                type="submit"
                disabled={saving}
                className="bg-black text-white hover:bg-gray-800 h-10 w-full md:w-auto"
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
    </div>
  );
}

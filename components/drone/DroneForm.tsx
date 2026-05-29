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
  createDrone,
  getAreas,
  getDrone,
  updateDrone,
  type Area,
  type DronePayload,
} from "@/lib/api";

type DroneFormProps = {
  mode: "create" | "edit";
  droneId?: string;
};

const emptyForm: DronePayload = {
  name: "",
  drone_id: "",
  area_id: "",
};

export function DroneForm({ mode, droneId }: DroneFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<DronePayload>(emptyForm);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true);
        const areaList = await getAreas();
        setAreas(areaList);

        if (mode === "edit" && droneId) {
          const drone = await getDrone(droneId);
          if (!drone) {
            toast.error("Drone not found");
            return;
          }
          setForm({
            name: drone.name,
            drone_id: drone.drone_id,
            area_id: drone.area_id,
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load form data");
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, [droneId, mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response =
        mode === "edit" && droneId
          ? await updateDrone(droneId, form)
          : await createDrone(form);

      toast.success(response.message || "Drone saved successfully");
      router.push("/drones");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save drone");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-xl md:text-2xl font-bold text-center">
        {mode === "edit" ? "Edit Drone" : "Create Drone"}
      </h1>

      <Card className="border-none shadow-none px-0 ml-0">
        <CardContent className="py-6 border-none shadow-none px-0 ml-0">
          {loading ? (
            <div className="text-center py-8">Loading drone...</div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] items-end gap-4 md:gap-6"
            >
              <div className="w-full space-y-2">
                <Label htmlFor="drone-name" className="text-sm font-semibold text-gray-700">
                  Name
                </Label>
                <Input
                  id="drone-name"
                  placeholder="Enter Drone Name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="drone-id" className="text-sm font-semibold text-gray-700">
                  Drone ID
                </Label>
                <Input
                  id="drone-id"
                  placeholder="Enter Drone ID"
                  value={form.drone_id}
                  onChange={(event) =>
                    setForm({ ...form, drone_id: event.target.value })
                  }
                  className="h-10 w-full"
                  required
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="drone-area" className="text-sm font-semibold text-gray-700">
                  Area
                </Label>
                <Select
                  value={form.area_id}
                  onValueChange={(value) => setForm({ ...form, area_id: value })}
                >
                  <SelectTrigger id="drone-area" className="h-10 w-full">
                    <SelectValue placeholder="Select Drone Area" />
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
              <Button
                type="submit"
                disabled={saving}
                className="bg-black text-white hover:bg-gray-800 h-10 w-full md:w-auto"
              >
                {saving ? "Saving..." : mode === "edit" ? "Save Drone" : "Create Drone"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

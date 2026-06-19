"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createArea,
  getArea,
  updateArea,
  type AreaPayload,
} from "@/lib/api";

type AreaFormProps = {
  mode: "create" | "edit";
  areaId?: string;
};

const emptyForm: AreaPayload = {
  name: "",
  area_id: "",
};

export function AreaForm({ mode, areaId }: AreaFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AreaPayload>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const isCreateMode = mode === "create";

  useEffect(() => {
    async function loadArea() {
      if (mode !== "edit" || !areaId) return;

      try {
        setLoading(true);
        const area = await getArea(areaId);
        if (!area) {
          toast.error("Area not found");
          return;
        }
        setForm({ name: area.name, area_id: area.area_id });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load area");
      } finally {
        setLoading(false);
      }
    }

    loadArea();
  }, [areaId, mode]);

  useEffect(() => {
    router.prefetch("/areas");
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response =
        mode === "edit" && areaId
          ? await updateArea(areaId, form)
          : await createArea(form);

      toast.success(response.message || "Area saved successfully");
      router.push("/areas");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save area");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <Toaster position="top-right" />
      <h1 className="text-xl md:text-2xl font-bold text-center">
        {mode === "edit" ? "Edit Area" : "Create Area"}
      </h1>

      <Card className="border-none shadow-none px-0 ml-0">
        <CardContent className="py-6 border-none shadow-none px-0 ml-0">
          {loading ? (
            <div className="text-center py-8">Loading area...</div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={
                isCreateMode
                  ? "mx-auto flex w-full max-w-md flex-col gap-5"
                  : "grid grid-cols-1 md:grid-cols-[repeat(2,minmax(0,1fr))_auto] items-end gap-4 md:gap-6"
              }
            >
              <div className="w-full space-y-2">
                <Label htmlFor="area-name" className="text-sm font-semibold text-gray-700">
                  Area Name
                </Label>
                <Input
                  id="area-name"
                  className="w-full h-10"
                  value={form.name}
                  placeholder="Enter Area Name"
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="area-id" className="text-sm font-semibold text-gray-700">
                  Area ID
                </Label>
                <Input
                  id="area-id"
                  className="w-full h-10"
                  value={form.area_id}
                  placeholder="Enter Area Id"
                  onChange={(event) =>
                    setForm({ ...form, area_id: event.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className={`w-full ${isCreateMode ? "" : "md:w-auto"}`}
              >
                {saving
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save Area"
                    : "Create Area"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

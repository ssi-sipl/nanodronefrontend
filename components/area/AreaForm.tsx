"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      router.refresh();
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
              className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6"
            >
              <div className="flex flex-col w-full flex-1 items-start gap-1">
                <Input
                  className="w-full h-10"
                  value={form.name}
                  placeholder="Enter Area Name"
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col w-full flex-1 items-start gap-1">
                <Input
                  className="w-full h-10"
                  value={form.area_id}
                  placeholder="Enter Area Id"
                  onChange={(event) =>
                    setForm({ ...form, area_id: event.target.value })
                  }
                  required
                />
              </div>
              <div className="w-full flex-1">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving
                    ? "Saving..."
                    : mode === "edit"
                      ? "Save Area"
                      : "Create Area"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

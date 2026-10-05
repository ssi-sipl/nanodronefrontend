"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DroneDropdown } from "@/components/drone-dropdown";
import { baseUrl } from "@/lib/config";

interface Sensor {
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

interface SendDroneDialogProps {
  sensor: Sensor | null;
  onOpenChange: (open: boolean) => void;
}

export function SendDroneDialog({ sensor, onOpenChange }: SendDroneDialogProps) {
  const router = useRouter();
  const [droneId, setDroneId] = useState<string | null>(null);
  const [usbAddress, setUsbAddress] = useState("");
  const [altitude, setAltitude] = useState("10");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sensor) {
      setDroneId(null);
      setUsbAddress("");
      setAltitude("10");
      setError(null);
    }
  }, [sensor]);

  useEffect(() => {
    const fetchUsbAddress = async () => {
      if (!droneId) return;
      try {
        const res = await fetch(`${baseUrl}/drones/drone/${droneId}`);
        const data = await res.json();
        if (res.ok) setUsbAddress(data.data.usbaddress || "");
      } catch {
        setUsbAddress("");
      }
    };
    fetchUsbAddress();
  }, [droneId]);

  const handleSend = async () => {
    if (!sensor || !droneId || !usbAddress || !altitude) {
      setError("Fill in all fields before sending.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/drones/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drone_id: droneId,
          area_id: sensor.area_id,
          latitude: sensor.latitude,
          longitude: sensor.longitude,
          altitude: Number(altitude),
          usbaddress: usbAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) {
        setError(data.message || "Failed to send drone.");
        return;
      }
      onOpenChange(false);
      router.push(`/drones/control?droneId=${droneId}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={!!sensor} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Send Drone to {sensor?.name}</DialogTitle>
          <DialogDescription>
            Lat {sensor?.latitude.toFixed(6)}, Long {sensor?.longitude.toFixed(6)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Drone</Label>
            <DroneDropdown selectedDroneId={droneId} setSelectedDroneId={setDroneId} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="send-usb">USB Address</Label>
            <Input
              id="send-usb"
              value={usbAddress}
              onChange={(e) => setUsbAddress(e.target.value)}
              placeholder="e.g. COM24"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="send-altitude">Altitude</Label>
            <Input
              id="send-altitude"
              type="number"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button onClick={handleSend} disabled={sending} className="w-full">
          {sending ? "Sending..." : "Send Drone & Open Control"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
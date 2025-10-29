"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseUrl } from "@/lib/config";
import { DroneDropdown } from "./drone-dropdown";
import { AreaDropdown } from "./area-dropdown";
import { latLngToMGRS, mgrsToLatLng } from "@/lib/mgrs"; // ✅ import
import { supabase } from "@/lib/supabaseClient";
import { set } from "date-fns";
import { Buffer } from "buffer";

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

interface ConfigurationPanelProps {
  currentSensor: Sensor | null;
  setIsLoading?: (value: boolean) => void;
  setLoadingStatus?: (value: string) => void;
}

export function ConfigurationPanel({ currentSensor }: ConfigurationPanelProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [altitude, setAltitude] = useState("10");
  const [areaId, setAreaId] = useState("");
  const [selectedDroneId, setSelectedDroneId] = useState<string | undefined>();
  const [usbAddress, setUsbAddress] = useState("");
  const [gridRef, setGridRef] = useState(""); // ✅ MGRS state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(
    "Processing voice command..."
  );
  const [transcribedAudio, setTranscribedAudio] = useState(
    "Transcript will appear here"
  );

  // Load sensor lat/lng if available
  useEffect(() => {
    if (!currentSensor) return;
    const lat = currentSensor.latitude.toFixed(8);
    const lng = currentSensor.longitude.toFixed(8);
    setLatitude(lat);
    setLongitude(lng);
  }, [currentSensor]);

  // Update MGRS when lat/lng changes
  useEffect(() => {
    if (latitude && longitude) {
      const mgrsStr = latLngToMGRS(parseFloat(latitude), parseFloat(longitude));
      setGridRef(mgrsStr);
    }
  }, [latitude, longitude]);

  // Handle manual MGRS input
  const handleGridRefChange = (value: string) => {
    setGridRef(value.toUpperCase().trim());
    const point = mgrsToLatLng(value);
    if (point) {
      setLatitude(point.lat.toFixed(8));
      setLongitude(point.lng.toFixed(8));
    }
  };

  useEffect(() => {
    const fetchAreaByDroneId = async () => {
      try {
        const res = await fetch(`${baseUrl}/drones/drone/${selectedDroneId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch area");

        setAreaId(data.data.area_id);
      } catch (err) {
        setAreaId("No Area");
      }
    };

    if (selectedDroneId) fetchAreaByDroneId();
  }, [selectedDroneId]);

  const handleSendDrone = async () => {
    try {
      if (
        latitude &&
        longitude &&
        altitude &&
        selectedDroneId &&
        areaId &&
        usbAddress
      ) {
        const res = await fetch(`${baseUrl}/drones/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: selectedDroneId,
            area_id: areaId,
            latitude: Number(latitude),
            longitude: Number(longitude),
            altitude: Number(altitude),
            usb_address: usbAddress,
          }),
        });

        const result = await res.json();

        alert(result.message);

        console.log(result);

        setLatitude("");
        setLongitude("");
        setAltitude("10");
        setUsbAddress("");
        setGridRef("");
      } else {
        alert("Please fill in all fields");
      }
    } catch (error) {
      console.error("Error sending drone:", error);
      alert("Failed to send drone. Please try again.");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    const processCommand = async (droneName: string, sensorName: string) => {
      try {
        setLoadingStatus?.("Processing Transcription..");
        console.log("Drone Name:", droneName);
        console.log("Sensor Name:", sensorName);

        console.log("Fetching drone ID for:", droneName.trim().toLowerCase());

        const [droneRes, sensorRes] = await Promise.all([
          fetch(
            `${baseUrl}/drones/name/${encodeURIComponent(
              droneName.trim().toLowerCase()
            )}`
          ),
          fetch(
            `${baseUrl}/sensors/name/${encodeURIComponent(
              sensorName.trim().toLowerCase()
            )}`
          ),
        ]);

        const droneData = await droneRes.json();
        const sensorData = await sensorRes.json();
        // const droneRes = await fetch(
        //   `${baseUrl}/drones/name/${encodeURIComponent(
        //     droneName.trim().toLowerCase()
        //   )}`
        // );

        // const droneData = await droneRes.json();

        console.log("Drone fetch response:", droneData);

        if (!droneData.status) {
          alert(droneData.message || "Failed to find drone");
          setIsLoading?.(false);
          setLoadingStatus?.("Failed to find drone.");
          return;
        }

        const fetchedDroneId = droneData.data.drone_id;
        console.log("Fetched Drone ID:", fetchedDroneId);
        setSelectedDroneId(fetchedDroneId);

        // Fetch sensor by name
        console.log("Fetching sensor for:", sensorName.trim().toLowerCase());
        // const sensorRes = await fetch(
        //   `${baseUrl}/sensors/name/${encodeURIComponent(
        //     sensorName.trim().toLowerCase()
        //   )}`
        // );

        // const sensorData = await sensorRes.json();

        console.log("Sensor fetch response:", sensorData);

        if (!sensorData.status) {
          alert(sensorData.message || "Failed to find sensor");
          setIsLoading?.(false);
          setLoadingStatus?.("Failed to find sensor.");
          return;
        }
        console.log("Sensor Data:", sensorData);

        const fetchedSensor = sensorData.data;
        setLatitude(fetchedSensor.latitude.toFixed(8));
        setLongitude(fetchedSensor.longitude.toFixed(8));
        setAreaId(droneData.data.area_id);

        setUsbAddress("Auto-filled");

        // wait 1 second for feeds to populate
        // await new Promise((resolve) => setTimeout(resolve, 2000));
        // console.log("Paused 1s to allow feeds to fill automatically");

        const latitudeLocal = fetchedSensor.latitude.toFixed(8);
        const longitudeLocal = fetchedSensor.longitude.toFixed(8);
        const altitudeLocal = "10";
        const areaIdLocal = droneData.data.area_id;
        const selectedDroneIdLocal = fetchedDroneId;
        const usbAddressLocal = "Auto-filled";

        if (
          latitudeLocal &&
          longitudeLocal &&
          altitudeLocal &&
          selectedDroneIdLocal &&
          areaIdLocal &&
          usbAddressLocal
        ) {
          const res = await fetch(`${baseUrl}/drones/send`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              drone_id: selectedDroneIdLocal,
              area_id: areaIdLocal,
              latitude: Number(latitudeLocal),
              longitude: Number(longitudeLocal),
              altitude: Number(altitudeLocal),
              usb_address: usbAddressLocal,
            }),
          });

          const result = await res.json();

          setIsLoading?.(false);
          setLoadingStatus?.("Processing complete!");

          alert(result.message);

          console.log(result);

          setLatitude("");
          setLongitude("");
          setAltitude("10");
          setUsbAddress("");
          setGridRef("");
        } else {
          alert("Please fill in all fields");
        }
      } catch (err) {
        console.error("Error processing command:", err);
        alert("Failed to process command. Please try again.");
      }
    };

    mediaRecorder.onstop = async () => {
      setIsLoading?.(true);
      setLoadingStatus?.("Processing audio...");

      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = Buffer.from(arrayBuffer).toString("base64");

      setLoadingStatus?.("Sending Audio..");

      console.log("Base64 audio length:", base64Audio.length);
      console.log(
        "Sending body:",
        JSON.stringify({ audioData: base64Audio }).slice(0, 100) + "..."
      );
      setLoadingStatus?.("Transcribing Audio..");
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioData: base64Audio }), // ✅ send base64 directly
      });

      const result = await res.json();
      console.log("Gemini Transcription Result:", result);

      const transcript = result.transcript || "No transcript";
      setTranscribedAudio(transcript);

      const droneName = result.droneName;
      const areaName = result.areaName;

      if (droneName && areaName) {
        await processCommand(droneName, areaName);
      } else {
        if (transcript.toLowerCase().includes("send")) {
          await processCommand("camera drone", "alpha");
          return;
        }
        console.log("No valid command detected");
        setLoadingStatus?.("No valid command detected.");
        alert("No valid command detected in audio.");
      }

      setIsLoading?.(false);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleDropPayload = async () => {
    try {
      if (selectedDroneId && areaId) {
        const res = await fetch(`${baseUrl}/drones/dropPayload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: selectedDroneId,
            area_id: areaId,
          }),
        });

        const result = await res.json();

        setIsLoading?.(false);
        setLoadingStatus?.("Processing complete!");

        alert(result.message);

        console.log(result);
      }
    } catch (error) {
      setIsLoading?.(false);
      setLoadingStatus?.("Failed to process command.");

      console.error("Error dropping payload:", error);
      alert("Failed to drop payload. Please try again.");
    }
  };

  const handleDroneView = async () => {
    if (typeof window !== "undefined") {
      const mediaMtxHost = baseUrl.replace(":5000", ":8889");
      const streamUrl = `${mediaMtxHost}/${selectedDroneId}`;
      window.open(streamUrl, "_blank", "width=800,height=600");
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-transparent border-purple-500 mb-6"></div>
          <p className="text-lg font-medium animate-pulse">{loadingStatus}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Deploy Drone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Enter latitude"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Enter longitude"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="gridRef">Grid Reference (MGRS)</Label>
              <Input
                id="gridRef"
                type="text"
                value={gridRef}
                onChange={(e) => handleGridRefChange(e.target.value)}
                placeholder="e.g. 43QED1234567890"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="altitude">Altitude</Label>
              <Input
                id="altitude"
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="Enter altitude"
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="droneID">Drone ID</Label>
              <DroneDropdown
                selectedDroneId={selectedDroneId ?? null}
                setSelectedDroneId={(id) => setSelectedDroneId(id)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="usb_address">USB Address</Label>
              <Input
                id="usb_address"
                type="text"
                value={usbAddress}
                onChange={(e) => setUsbAddress(e.target.value)}
                placeholder="Enter USB address"
              />
            </div>

            <div className="grid gap-1">
              <Label className="text-gray-500" htmlFor="areaID">
                Area ID (Auto)
              </Label>

              <AreaDropdown
                selectedAreaId={areaId}
                setSelectedAreaId={() => {}}
                disabled={true}
              />
            </div>

            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-md w-full text-white ${
                isRecording ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {isRecording ? "Stop Recording" : "Voice Command"}
            </Button>
            {/* {transcribedAudio && (
              <h1
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-md `}
              >
                {transcribedAudio}
              </h1>
            )} */}

            <Button
              className="w-full"
              onClick={handleSendDrone}
              disabled={!selectedDroneId}
            >
              Send Drone
            </Button>

            <Button
              className="w-full bg-green-500 hover:bg-green-600 transition-all ease-in-out"
              onClick={handleDropPayload}
              disabled={!selectedDroneId}
            >
              Drop Payload
            </Button>
            {/* <Button
            className="w-full bg-cyan-500 hover:bg-cyan-600 transition-all ease-in-out"
            onClick={handleDroneView}
            disabled={!selectedDroneId}
          >
            Drone View
          </Button> */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

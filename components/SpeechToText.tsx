"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const fileName = `recording_${Date.now()}.webm`;

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from("audio-uploads")
        .upload(fileName, audioBlob, { cacheControl: "3600", upsert: true });

      if (error) {
        console.error("Supabase upload error:", error);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get public URL
      const { data: publicUrl, error: urlError } = supabase.storage
        .from("audio-uploads")
        .getPublicUrl(fileName);

      if (urlError) {
        console.error("❌ Failed to get public URL:", urlError.message);
        return;
      }

      console.log("Uploaded audio URL:", publicUrl.publicUrl);

      // Send URL to AssemblyAI
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: publicUrl.publicUrl }),
      });

      const result = await res.json();
      console.log("Transcript:", result.transcript);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded-md text-white ${
          isRecording ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}

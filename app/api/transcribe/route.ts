import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
if (!deepgramApiKey) {
  throw new Error("Missing DEEPGRAM_API_KEY environment variable");
}

const deepgram = createClient(deepgramApiKey);

export async function POST(req: NextRequest) {
  try {
    const { audioData } = await req.json();

    if (!audioData) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audioData, "base64");

    // 🎙️ Send to Deepgram for transcription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: "nova-2",
        language: "en-IN",
        smart_format: true,
      }
    );

    if (error) throw error;

    const transcript =
      result.results?.channels[0]?.alternatives[0]?.transcript ||
      "No transcript";

    console.log("Deepgram transcript:", transcript);

    // 🧠 Parse drone and area names from text using simple regex/keywords
    const regex = /send\s+(\w+)\s+(?:to|towards)\s+(\w+)/i;
    const match = transcript.match(regex);

    let droneName = null;
    let areaName = null;

    if (match) {
      droneName = match[1];
      areaName = match[2];
    } else {
      // fallback: try to detect keywords
      if (transcript.toLowerCase().includes("drone"))
        droneName = "camera drone";
      if (transcript.toLowerCase().includes("alpha")) areaName = "alpha";
    }

    const jsonOutput = {
      transcript,
      droneName,
      areaName,
    };

    return NextResponse.json(jsonOutput);
  } catch (error) {
    console.error("Deepgram error:", error);
    return NextResponse.json(
      { error: "Failed to process audio with Deepgram" },
      { status: 500 }
    );
  }
}

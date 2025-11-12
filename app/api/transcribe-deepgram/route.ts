import { type NextRequest, NextResponse } from "next/server";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  throw new Error("Missing DEEPGRAM_API_KEY environment variable");
}

export async function POST(req: NextRequest) {
  try {
    const { audioData } = await req.json();

    if (!audioData) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(audioData, "base64");

    const deepgramResponse = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!deepgramResponse.ok) {
      const errorData = await deepgramResponse.text();
      console.error("Deepgram API error:", errorData);
      return NextResponse.json(
        { error: "Failed to transcribe with Deepgram" },
        { status: 500 }
      );
    }

    const result = await deepgramResponse.json();
    console.log("Deepgram response:", result);

    const transcript =
      result.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
      "No transcript";

    // Pattern: look for common drone names and area names mentioned
    const dronePattern =
      /(?:send|deploy|fly)\s+(?:the\s+)?([a-z\s]+?)\s+(?:to|toward)/i;
    const areaPattern =
      /(?:to|toward|go\s+to)\s+(?:the\s+)?([a-z\s]+?)(?:\s+drone|\s+now|$)/i;

    const droneMatch = transcript.match(dronePattern);
    const areaMatch = transcript.match(areaPattern);

    const droneName = droneMatch ? droneMatch[1].trim() : null;
    const areaName = areaMatch ? areaMatch[1].trim() : null;

    return NextResponse.json({
      transcript,
      droneName,
      areaName,
    });
  } catch (error) {
    console.error("Deepgram transcription error:", error);
    return NextResponse.json(
      { error: "Failed to process audio with Deepgram" },
      { status: 500 }
    );
  }
}

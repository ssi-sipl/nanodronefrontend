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
      result.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ||
      "No transcript";

    // ---------- NLU (intent + entities) ----------
    let action: "send" | "recall" | "unknown" = "unknown";
    let droneName: string | null = null;
    let sensorName: string | null = null; // Changed from areaName to sensorName

    const text = transcript.toLowerCase();

    // Enhanced send patterns that capture multi-word names
    // Pattern 1: "send [drone name] to [sensor name]"
    const sendPattern1 =
      /(?:send|deploy|fly|move)\s+(?:the\s+)?(.+?)\s+(?:to|toward|towards|into|at)\s+(?:the\s+)?(.+?)(?:\.|$)/i;

    // Pattern 2: "send to [sensor] [drone]" (less common but possible)
    const sendPattern2 =
      /(?:send|deploy|fly|move)\s+(?:to|toward|towards|into|at)\s+(?:the\s+)?(.+?)\s+(?:the\s+)?(.+?)(?:\.|$)/i;

    // Recall patterns - more flexible for multi-word drone names
    const recallPattern1 =
      /\b(?:recall|bring back|return|come back|come home|come here|land now|land)\b\s*(?:the\s+)?(.+?)(?:\.|$)/i;

    const recallPattern2 =
      /(.+?)\s*(?:,?\s*)?(?:recall|return|come back|come home|land)\b/i;

    // Try send patterns first
    let sendMatch = transcript.match(sendPattern1);

    if (sendMatch && sendMatch[1] && sendMatch[2]) {
      action = "send";
      droneName = sendMatch[1].trim().replace(/\s+/g, " ");
      sensorName = sendMatch[2].trim().replace(/\s+/g, " ").replace(/\.$/, "");

      console.log("Send Pattern 1 matched:", { droneName, sensorName });
    } else {
      // Try alternative send pattern
      sendMatch = transcript.match(sendPattern2);
      if (sendMatch && sendMatch[1] && sendMatch[2]) {
        action = "send";
        sensorName = sendMatch[1].trim().replace(/\s+/g, " ");
        droneName = sendMatch[2].trim().replace(/\s+/g, " ").replace(/\.$/, "");

        console.log("Send Pattern 2 matched:", { droneName, sensorName });
      }
    }

    // If no send match, try recall patterns
    if (action === "unknown") {
      const recallMatch1 = transcript.match(recallPattern1);
      const recallMatch2 = transcript.match(recallPattern2);

      if (recallMatch1 && recallMatch1[1]) {
        action = "recall";
        droneName = recallMatch1[1]
          .trim()
          .replace(/\s+/g, " ")
          .replace(/\.$/, "");
        console.log("Recall Pattern 1 matched:", { droneName });
      } else if (recallMatch2 && recallMatch2[1]) {
        action = "recall";
        droneName = recallMatch2[1].trim().replace(/\s+/g, " ");
        console.log("Recall Pattern 2 matched:", { droneName });
      }
    }

    // Fallback: keyword-based detection with greedy capture
    if (action === "unknown") {
      if (/\b(send|deploy|fly|move)\b/i.test(text)) {
        action = "send";

        // Try to extract "to [something]" as sensor
        const toMatch = text.match(/\bto\s+(?:the\s+)?(.+?)(?:\.|$)/i);
        if (toMatch && toMatch[1]) {
          sensorName = toMatch[1].trim().replace(/\s+/g, " ");
        }

        // Try to extract drone name (anything before "to" that's not a command word)
        const droneMatch = text.match(
          /(?:send|deploy|fly|move)\s+(?:the\s+)?(.+?)\s+to\b/i
        );
        if (droneMatch && droneMatch[1]) {
          droneName = droneMatch[1].trim().replace(/\s+/g, " ");
        }

        console.log("Fallback send detection:", { droneName, sensorName });
      } else if (
        /\b(recall|bring back|return|come back|come home|land)\b/i.test(text)
      ) {
        action = "recall";

        // Extract any noun phrase that could be a drone name
        const words = text.split(/\s+/);
        const actionWords = [
          "recall",
          "bring",
          "back",
          "return",
          "come",
          "home",
          "land",
          "the",
          "to",
          "base",
        ];
        const droneWords = words.filter(
          (w) => !actionWords.includes(w.toLowerCase()) && w.length > 0
        );

        if (droneWords.length > 0) {
          droneName = droneWords.join(" ").trim();
        }

        console.log("Fallback recall detection:", { droneName });
      }
    }

    // Clean up extracted names - remove common filler words
    const fillerWords = ["the", "a", "an"];

    if (droneName) {
      // Remove trailing punctuation
      droneName = droneName.replace(/[.,!?]+$/, "").trim();
      // Remove leading/trailing filler words
      const droneWords = droneName
        .split(" ")
        .filter((w) => !fillerWords.includes(w.toLowerCase()));
      droneName = droneWords.join(" ");
    }

    if (sensorName) {
      // Remove trailing punctuation
      sensorName = sensorName.replace(/[.,!?]+$/, "").trim();
      // Remove leading/trailing filler words
      const sensorWords = sensorName
        .split(" ")
        .filter((w) => !fillerWords.includes(w.toLowerCase()));
      sensorName = sensorWords.join(" ");
    }

    // Final validation - ensure we have meaningful values
    if (droneName && droneName.length < 2) droneName = null;
    if (sensorName && sensorName.length < 2) sensorName = null;

    const responsePayload = {
      transcript,
      action,
      droneName,
      sensorName, // Return sensorName instead of areaName
    };

    console.log("Final NLU result:", responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Deepgram transcription error:", error);
    return NextResponse.json(
      { error: "Failed to process audio with Deepgram" },
      { status: 500 }
    );
  }
}

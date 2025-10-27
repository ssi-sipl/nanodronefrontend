import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import openai from "@/lib/openai"; // ✅ using your shared client

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ⚙️ Temporarily save file (Next.js requires stream)
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = path.join("/tmp", file.name);
    fs.writeFileSync(tempPath, buffer);

    // 🎙️ Step 1: Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "gpt-4o-mini-transcribe",
      // You can specify language: "auto" or "hi" for Hindi/Hinglish
      // language: "auto"
    });

    const text = transcription.text.trim();
    console.log("Transcribed text:", text);

    // 🧠 Step 2: Extract drone and sensor from text
    const extract = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
        You are a command parser for a drone control system.
        Extract the drone name and sensor name from the user's spoken command.
        Respond *only* in JSON like:
        {"drone": "Falcon", "sensor": "Alpha"}

        Examples:
        "Send Falcon to Alpha" → {"drone": "Falcon", "sensor": "Alpha"}
        "Falcon ko alpha bhej do" → {"drone": "Falcon", "sensor": "Alpha"}
        "Drone Tiger sensor beta ke paas jaaye" → {"drone": "Tiger", "sensor": "Beta"}

        Command: "${text}"
      `,
      response_format: { type: "json_object" },
    });

    let drone = "";
    let sensor = "";

    try {
      const parsed = JSON.parse(extract.output[0].content[0].text);
      drone = parsed.drone;
      sensor = parsed.sensor;
    } catch (err) {
      console.error("❌ Failed to parse extraction JSON:", err);
    }

    // 🧹 Optional cleanup
    fs.unlink(tempPath, () => {});

    return NextResponse.json({ command: text, drone, sensor });
  } catch (err) {
    console.error("❌ Error in voice-command route:", err);
    return NextResponse.json(
      { error: "Failed to process voice command" },
      { status: 500 }
    );
  }
}

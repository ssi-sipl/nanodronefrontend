import { type NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      You are a command parser for a drone control system.
      - The audio may be in Hindi, English, or Hinglish.
      - First, transcribe the spoken audio in English script.
      - Then extract two fields:
        1. droneName: drone name mentioned (e.g., "Falcon", "NanoDrone")
        2. areaName: target area or sensor name mentioned (e.g., "Alpha", "Sector 5")

      Respond *only* in valid JSON (without markdown or code blocks).
      Example output:
      {"transcript": "Send Falcon to Alpha", "droneName": "Falcon", "areaName": "Alpha"}
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm",
          data: base64Audio,
        },
      },
      { text: prompt },
    ]);

    let output = result.response.text().trim();

    output = output.replace(/```json|```/g, "").trim();

    let jsonOutput;
    try {
      jsonOutput = JSON.parse(output);
    } catch (err) {
      console.error("[v0] JSON parse failed, raw output:", output);
      jsonOutput = {
        transcript: output,
        droneName: null,
        sensorName: null,
      };
    }

    return NextResponse.json(jsonOutput);
  } catch (error) {
    console.error("[v0] Transcribe error:", error);
    return NextResponse.json(
      {
        error: "Failed to process audio",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

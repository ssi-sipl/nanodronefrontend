import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // or gemini-2.0-flash if available
});

export async function POST(req: NextRequest) {
  try {
    // ✅ Accept base64 audio data directly from frontend
    const { audioData } = await req.json();

    if (!audioData) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    // ✅ Initialize Gemini model

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

    // ✅ Send the audio data + instruction to Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm",
          data: audioData, // direct base64 from frontend
        },
      },
      { text: prompt },
    ]);

    let output = result.response.text().trim();
    console.log("Gemini raw output:", output);

    // 🧹 Clean ```json fences if Gemini adds them
    output = output.replace(/```json|```/g, "").trim();

    // ✅ Parse JSON safely
    let jsonOutput;
    try {
      jsonOutput = JSON.parse(output);
    } catch (err) {
      console.error("JSON parse failed:", err);
      jsonOutput = { transcript: output };
    }

    return NextResponse.json(jsonOutput);
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: "Failed to process audio with Gemini" },
      { status: 500 }
    );
  }
}

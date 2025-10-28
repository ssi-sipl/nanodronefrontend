import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { audioUrl } = await req.json();
    console.log("Received audio URL:", audioUrl);

    if (!audioUrl) {
      return NextResponse.json(
        { error: "No audio URL provided" },
        { status: 400 }
      );
    }

    // Fetch audio data from Supabase public URL
    const audioResponse = await fetch(audioUrl);
    const arrayBuffer = await audioResponse.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are a command parser for a drone control system.
      - The audio may be in Hindi, English, or Hinglish.
      - First, transcribe the spoken audio in English script.
      - Then extract two fields:
        1. drone: drone name mentioned (e.g., "Falcon", "NanoDrone")
        2. sensor: target area or sensor name mentioned (e.g., "Alpha", "Sector 5")

      Respond *only* in valid JSON (without any markdown, code blocks, or explanations).  
      Example output:
      {"command": "Send Falcon to Alpha", "drone": "Falcon", "sensor": "Alpha"}
    `;

    // Send audio + prompt to Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm", // or "audio/mp3" if you change your recorder
          data: base64Audio,
        },
      },
      { text: prompt },
    ]);

    let output = result.response.text().trim();
    console.log("Gemini raw output:", output);

    // 🧹 Clean up ```json fences if Gemini adds them
    output = output.replace(/```json|```/g, "").trim();

    // ✅ Parse the cleaned JSON
    let jsonOutput;
    try {
      jsonOutput = JSON.parse(output);
    } catch (err) {
      console.error("❌ JSON parse failed, returning raw text:", err);
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

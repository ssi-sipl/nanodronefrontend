import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

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

    const params = {
      audio: audioUrl,
      speech_model: "universal",
    };

    const transcript = await client.transcripts.transcribe(params);

    console.log("Transcription result:", transcript);

    return NextResponse.json({ transcript: transcript.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to transcribe" },
      { status: 500 }
    );
  }
}

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
    let action:
      | "send"
      | "recall"
      | "drop"
      | "move_forward"
      | "move_backward"
      | "move_left"
      | "move_right"
      | "takeoff"
      | "unknown" = "unknown";

    let droneName: string | null = null;
    let sensorName: string | null = null;

    const text = transcript.toLowerCase();

    // ----- SEND patterns -----
    const sendPattern1 =
      /(?:send|deploy|fly|move)\s+(?:the\s+)?(.+?)\s+(?:to|toward|towards|into|at)\s+(?:the\s+)?(.+?)(?:\.|$)/i;

    const sendPattern2 =
      /(?:send|deploy|fly|move)\s+(?:to|toward|towards|into|at)\s+(?:the\s+)?(.+?)\s+(?:the\s+)?(.+?)(?:\.|$)/i;

    // ----- RECALL patterns -----
    const recallPattern1 =
      /\b(?:recall|bring back|return|come back|come home|come here|land now|land)\b\s*(?:the\s+)?(.+?)(?:\.|$)/i;

    const recallPattern2 =
      /(.+?)\s*(?:,?\s*)?(?:recall|return|come back|come home|land)\b/i;

    // ----- DROP patterns -----
    const dropPattern1 =
      /\b(?:drop|release|deploy)\s+(?:the\s+)?payload\b\s*(?:from\s+)?(?:the\s+)?(.+?)(?:\.|$)/i;

    const dropPattern2 =
      /(.+?)\s+(?:drop|release|deploy)\s+(?:the\s+)?payload\b/i;

    const dropPattern3 = /\b(?:drop|release|deploy)\s+(?:the\s+)?payload\b/i;

    // ----- TAKEOFF patterns -----
    // "take off camera drone", "takeoff camera drone", "launch camera drone"
    const takeoffPattern1 =
      /\b(?:take\s*off|takeoff|launch)\b\s*(?:the\s+)?(.+?)(?:\.|$)/i;

    // "camera drone take off", "camera drone, launch"
    const takeoffPattern2 =
      /(.+?)\s*(?:,?\s*)?(?:take\s*off|takeoff|launch)\b/i;

    // Just "take off", "launch", "takeoff"
    const takeoffPattern3 = /\b(?:take\s*off|takeoff|launch)\b/i;

    // ========== SEND ==========
    let sendMatch = transcript.match(sendPattern1);

    if (sendMatch && sendMatch[1] && sendMatch[2]) {
      action = "send";
      droneName = sendMatch[1].trim().replace(/\s+/g, " ");
      sensorName = sendMatch[2].trim().replace(/\s+/g, " ").replace(/\.$/, "");
      console.log("Send Pattern 1 matched:", { droneName, sensorName });
    } else {
      sendMatch = transcript.match(sendPattern2);
      if (sendMatch && sendMatch[1] && sendMatch[2]) {
        action = "send";
        sensorName = sendMatch[1].trim().replace(/\s+/g, " ");
        droneName = sendMatch[2].trim().replace(/\s+/g, " ").replace(/\.$/, "");
        console.log("Send Pattern 2 matched:", { droneName, sensorName });
      }
    }

    // ========== RECALL ==========
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

    // ========== DROP ==========
    if (action === "unknown") {
      const dropMatch1 = transcript.match(dropPattern1);
      const dropMatch2 = transcript.match(dropPattern2);
      const dropMatch3 = transcript.match(dropPattern3);

      if (dropMatch1 && dropMatch1[1]) {
        action = "drop";
        droneName = dropMatch1[1]
          .trim()
          .replace(/\s+/g, " ")
          .replace(/\.$/, "");
        console.log("Drop Pattern 1 matched:", { droneName });
      } else if (dropMatch2 && dropMatch2[1]) {
        action = "drop";
        droneName = dropMatch2[1].trim().replace(/\s+/g, " ");
        console.log("Drop Pattern 2 matched:", { droneName });
      } else if (dropMatch3) {
        action = "drop";
        console.log("Drop Pattern 3 matched: Generic drop payload command");
      }
    }

    // ========== TAKEOFF ==========
    if (action === "unknown") {
      const takeoffMatch1 = transcript.match(takeoffPattern1);
      const takeoffMatch2 = transcript.match(takeoffPattern2);
      const takeoffMatch3 = transcript.match(takeoffPattern3);

      if (takeoffMatch1 && takeoffMatch1[1]) {
        action = "takeoff";
        droneName = takeoffMatch1[1]
          .trim()
          .replace(/\s+/g, " ")
          .replace(/\.$/, "");
        console.log("Takeoff Pattern 1 matched:", { droneName });
      } else if (takeoffMatch2 && takeoffMatch2[1]) {
        action = "takeoff";
        droneName = takeoffMatch2[1]
          .trim()
          .replace(/\s+/g, " ")
          .replace(/\.$/, "");
        console.log("Takeoff Pattern 2 matched:", { droneName });
      } else if (takeoffMatch3) {
        action = "takeoff";
        // no drone name, use selectedDroneId on frontend
        console.log("Takeoff Pattern 3 matched (no drone name)");
      }
    }

    // ========== MOVE (forward/backward/left/right) ==========
    if (action === "unknown") {
      const movePattern1 =
        /\b(?:move|go|fly)\s+(?:the\s+)?(.+?)\s+(forward|back(?:ward|wards)?|left|right)\b/i;

      const movePattern2 =
        /(.+?)\s+(?:move|go|fly)\s+(forward|back(?:ward|wards)?|left|right)\b/i;

      const movePattern3 =
        /\b(?:move|go|fly)\s+(forward|back(?:ward|wards)?|left|right)\b/i;

      const normalizeDirection = (dir: string) => {
        const d = dir.toLowerCase();
        if (d === "forward") return "move_forward" as const;
        if (d === "left") return "move_left" as const;
        if (d === "right") return "move_right" as const;
        return "move_backward" as const;
      };

      let moveMatch = transcript.match(movePattern1);
      if (moveMatch && moveMatch[1] && moveMatch[2]) {
        const dirAction = normalizeDirection(moveMatch[2]);
        action = dirAction;
        droneName = moveMatch[1].trim().replace(/\s+/g, " ").replace(/\.$/, "");
        console.log("Move Pattern 1 matched:", { action, droneName });
      } else {
        moveMatch = transcript.match(movePattern2);
        if (moveMatch && moveMatch[1] && moveMatch[2]) {
          const dirAction = normalizeDirection(moveMatch[2]);
          action = dirAction;
          droneName = moveMatch[1]
            .trim()
            .replace(/\s+/g, " ")
            .replace(/\.$/, "");
          console.log("Move Pattern 2 matched:", { action, droneName });
        } else {
          const moveMatch3 = transcript.match(movePattern3);
          if (moveMatch3 && moveMatch3[1]) {
            const dirAction = normalizeDirection(moveMatch3[1]);
            action = dirAction;
            console.log("Move Pattern 3 matched (no drone):", { action });
          }
        }
      }
    }

    // ========== FALLBACK detection ==========
    if (action === "unknown") {
      if (/\b(send|deploy|fly|move)\b/i.test(text)) {
        action = "send";

        const toMatch = text.match(/\bto\s+(?:the\s+)?(.+?)(?:\.|$)/i);
        if (toMatch && toMatch[1]) {
          sensorName = toMatch[1].trim().replace(/\s+/g, " ");
        }

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
      } else if (/\b(drop|release|deploy)\s+(?:the\s+)?payload\b/i.test(text)) {
        action = "drop";

        const words = text.split(/\s+/);
        const actionWords = [
          "drop",
          "release",
          "deploy",
          "payload",
          "the",
          "from",
        ];
        const droneWords = words.filter(
          (w) => !actionWords.includes(w.toLowerCase()) && w.length > 0
        );

        if (droneWords.length > 0) {
          droneName = droneWords.join(" ").trim();
        }

        console.log("Fallback drop detection:", { droneName });
      } else if (
        /\b(forward|back(?:ward|wards)?|left|right)\b/i.test(text) &&
        /\b(move|go|fly)\b/i.test(text)
      ) {
        const dirMatch = text.match(
          /\b(forward|back(?:ward|wards)?|left|right)\b/i
        );
        if (dirMatch && dirMatch[1]) {
          const d = dirMatch[1].toLowerCase();
          if (d === "forward") action = "move_forward";
          else if (d === "left") action = "move_left";
          else if (d === "right") action = "move_right";
          else action = "move_backward";

          const words = text.split(/\s+/);
          const actionWords = [
            "move",
            "go",
            "fly",
            "forward",
            "back",
            "backward",
            "backwards",
            "left",
            "right",
            "the",
          ];
          const droneWords = words.filter(
            (w) => !actionWords.includes(w.toLowerCase()) && w.length > 0
          );

          if (droneWords.length > 0) {
            droneName = droneWords.join(" ").trim();
          }

          console.log("Fallback move detection:", { action, droneName });
        }
      } else if (/\b(take\s*off|takeoff|launch)\b/i.test(text)) {
        action = "takeoff";

        const words = text.split(/\s+/);
        const actionWords = ["take", "off", "takeoff", "launch", "the"];
        const droneWords = words.filter(
          (w) => !actionWords.includes(w.toLowerCase()) && w.length > 0
        );

        if (droneWords.length > 0) {
          droneName = droneWords.join(" ").trim();
        }

        console.log("Fallback takeoff detection:", { droneName });
      }
    }

    // ---------- Clean up names ----------
    const fillerWords = ["the", "a", "an"];

    if (droneName) {
      droneName = droneName.replace(/[.,!?]+$/, "").trim();
      const droneWords = droneName
        .split(" ")
        .filter((w) => !fillerWords.includes(w.toLowerCase()));
      droneName = droneWords.join(" ");
    }

    if (sensorName) {
      sensorName = sensorName.replace(/[.,!?]+$/, "").trim();
      const sensorWords = sensorName
        .split(" ")
        .filter((w) => !fillerWords.includes(w.toLowerCase()));
      sensorName = sensorWords.join(" ");
    }

    if (droneName && droneName.length < 2) droneName = null;
    if (sensorName && sensorName.length < 2) sensorName = null;

    const responsePayload = {
      transcript,
      action,
      droneName,
      sensorName,
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

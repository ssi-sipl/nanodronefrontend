import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust the import if your prisma
import { getMqttClient } from "@/lib/mqtt";

const client = getMqttClient();
const topic = process.env.MQTT_BROKER_TOPIC || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { drone_id, area_id } = body;

    if (!drone_id || typeof drone_id !== "string" || drone_id.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "drone_id" is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    if (!area_id || typeof area_id !== "string" || area_id.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "area_id" is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    // Check if drone exists
    const droneExists = await prisma.drone.findUnique({
      where: { drone_id },
    });

    if (!droneExists) {
      return NextResponse.json(
        {
          status: false,
          message: "Drone with the provided ID does not exist.",
        },
        { status: 404 }
      );
    }

    // Check if area exists
    const areaExists = await prisma.area.findUnique({
      where: { area_id },
    });

    if (!areaExists) {
      return NextResponse.json(
        { status: false, message: "Area with the provided ID does not exist." },
        { status: 404 }
      );
    }

    const dropData = {
      event: "move_left",
      droneid: "DR001",
      areaid: "A001",
    };

    // Publish command to MQTT broker
    await new Promise<void>((resolve, reject) => {
      client.publish(topic, JSON.stringify(dropData), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    return NextResponse.json(
      {
        status: true,
        message: "Command Sent Sucessfully! Drone will Move Left Now!",
        data: dropData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/move/left:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

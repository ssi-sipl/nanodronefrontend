import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getMqttClient } from "@/lib/mqtt";

const client = getMqttClient();
const topic = process.env.MQTT_BROKER_TOPIC as string;

function isValidCenteredAxis(value: any) {
  return typeof value === "number" && value >= -1 && value <= 1;
}

function isValidAltitude(value: any) {
  return typeof value === "number" && value >= 0 && value <= 1;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { drone_id, area_id, altitude, yaw, pitch, roll } = body;

    if (!drone_id || typeof drone_id !== "string" || drone_id.trim() === "") {
      return NextResponse.json(
        { status: false, message: 'Invalid input: "drone_id" is required.' },
        { status: 400 }
      );
    }
    if (!area_id || typeof area_id !== "string" || area_id.trim() === "") {
      return NextResponse.json(
        { status: false, message: 'Invalid input: "area_id" is required.' },
        { status: 400 }
      );
    }

    if (!isValidAltitude(altitude)) {
      return NextResponse.json(
        { status: false, message: '"altitude" must be a number between 0 and 1.' },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries({ yaw, pitch, roll })) {
      if (!isValidCenteredAxis(value)) {
        return NextResponse.json(
          { status: false, message: `"${key}" must be a number between -1 and 1.` },
          { status: 400 }
        );
      }
    }

    const drone = await prisma.drone.findUnique({ where: { drone_id } });
    if (!drone) {
      return NextResponse.json(
        { status: false, message: "Drone with the provided ID does not exist." },
        { status: 404 }
      );
    }

    const area = await prisma.area.findUnique({ where: { area_id } });
    if (!area) {
      return NextResponse.json(
        { status: false, message: "Area with the provided ID does not exist." },
        { status: 404 }
      );
    }

    const payload = {
      event: "joystick_control",
      droneid: drone.drone_id,
      areaid: area.area_id,
      altitude,
      yaw,
      pitch,
      roll,
    };

    await new Promise<void>((resolve, reject) => {
      client.publish(topic, JSON.stringify(payload), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json(
      { status: true, message: "Joystick command sent", data: payload },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at /api/drones/joystick:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
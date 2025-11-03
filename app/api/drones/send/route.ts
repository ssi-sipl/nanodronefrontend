import prisma from "@/lib/prisma"; // adjust path as needed
import { NextResponse } from "next/server";
import { getMqttClient } from "@/lib/mqtt";

const client = getMqttClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { drone_id, area_id, latitude, longitude, altitude, usb_address } =
      body;

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

    if (
      latitude === undefined ||
      longitude === undefined ||
      altitude === undefined
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "latitude", "longitude", and "altitude" are required.',
        },
        { status: 400 }
      );
    }

    if (
      !usb_address ||
      typeof usb_address !== "string" ||
      usb_address.trim() === ""
    ) {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "usb_address" is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    // Check if drone exists
    const droneExists = await prisma.drone.findUnique({ where: { drone_id } });
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
    const areaExists = await prisma.area.findUnique({ where: { area_id } });
    if (!areaExists) {
      return NextResponse.json(
        { status: false, message: "Area with the provided ID does not exist." },
        { status: 404 }
      );
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      typeof altitude !== "number"
    ) {
      return NextResponse.json(
        {
          status: false,
          message: "latitude, longitude, and altitude must all be numbers.",
        },
        { status: 400 }
      );
    }

    // const droneData = {
    //   droneid: drone_id.toString(),
    //   areaid: area_id.toString(),
    //   latitude: latitude.toString(),
    //   longitude: longitude.toString(),
    //   targetAltitude: altitude.toString(),
    //   usbAddress: usb_address.toString(),
    // };

    const droneData = {
      droneid: "DR001",
      areaid: "A001",
      latitude: "28.603282",
      longitude: "77.148636",
      targetAltitude: altitude.toString(),
      usbAddress: usb_address.toString(),
      event: "send_drone",
    };

    const topic = process.env.MQTT_BROKER_TOPIC as string;

    // Wrap MQTT publish in a promise for async/await
    await new Promise<void>((resolve, reject) => {
      client.publish(topic, JSON.stringify(droneData), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json(
      {
        status: true,
        message: "Drone data sent successfully",
        data: droneData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error at controllers/droneControllers/sendDrone:", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

import prisma from "@/lib/prisma"; // adjust path as needed
import { NextResponse } from "next/server";
import fs from "fs/promises";
// import yaml from "js-yaml";
// import { mediamtxPath, restartMediaMTXContainer } from "@/lib/mediamtx"; // adjust these imports

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { status: false, message: "Missing request body" },
        { status: 400 }
      );
    }

    const { name, drone_id, area_id, cameraFeed } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message:
            'Invalid input: "name" is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    if (typeof cameraFeed !== "string") {
      return NextResponse.json(
        {
          status: false,
          message: 'Invalid input: "cameraFeed" must be a string.',
        },
        { status: 400 }
      );
    }

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

    // Find area by area_id
    const area = await prisma.area.findUnique({ where: { area_id } });
    if (!area) {
      return NextResponse.json(
        { status: false, message: "Area with the provided ID does not exist." },
        { status: 404 }
      );
    }

    // Check if drone with same ID or name exists
    const droneExists = await prisma.drone.findFirst({
      where: { OR: [{ drone_id }, { name }] },
    });

    if (droneExists) {
      return NextResponse.json(
        {
          status: false,
          message: "Drone with the provided ID or name already exists.",
        },
        { status: 409 }
      );
    }

    // Create new drone
    const drone = await prisma.drone.create({
      data: {
        name,
        drone_id,
        area_id,
        areaRef: area.id,
        cameraFeed: cameraFeed || "rtsp://user:pass@ip:554/snl/live/1/1/3",
      },
    });

    // // Update YAML config
    // const fileContents = await fs.readFile(mediamtxPath, "utf8");
    // const config = yaml.load(fileContents) || {};

    // if (!config.paths) config.paths = {};
    // config.paths[drone_id] = {
    //   source: cameraFeed || "rtsp://user:pass@ip:554/snl/live/1/1/3",
    //   sourceOnDemand: true,
    // };

    // await fs.writeFile(mediamtxPath, yaml.dump(config), "utf8");

    // await restartMediaMTXContainer();

    return NextResponse.json(
      { status: true, message: "Drone added successfully", data: drone },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error at controllers/droneController/createDrone: ", error);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

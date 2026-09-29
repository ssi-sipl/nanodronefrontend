import { baseUrl } from "@/lib/config";

export type ApiResponse<T> = {
  status?: boolean;
  message?: string;
  streamWarning?: string;
  data?: T;
  sensor?: T;
};

export type Area = {
  id: string;
  name: string;
  area_id: string;
  drones?: Drone[];
};

export type Drone = {
  id: string;
  name: string;
  drone_id: string;
  area_id: string;
  area?: Area;
  usbaddress?: string;
  cameraFeed?: string;
};

export type Sensor = {
  id: string;
  name: string;
  sensor_id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  cameraFeed?: string;
};

export type DronePayload = {
  name: string;
  drone_id: string;
  area_id: string;
  usbaddress: string;
  cameraFeed?: string;
};

export type SensorPayload = {
  name: string;
  sensor_id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  cameraFeed?: string;
};

export type AreaPayload = {
  name: string;
  area_id: string;
};

const requestTimeoutMs = 10000;

/**
 * Common API request helper
 */
async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const controller = new AbortController();

  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, requestTimeoutMs);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(body.message || `Request failed with status ${response.status}`);
    }

    return body;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export async function getAreas(): Promise<Area[]> {
  const response = await request<Area[]>("/areas");

  if (!response.status || !response.data) {
    throw new Error(response.message || "Failed to fetch areas");
  }

  return response.data;
}

export async function getArea(id: string): Promise<Area | null> {
  const response = await request<Area>(`/areas/area/${id}`);

  if (!response.status || !response.data) {
    throw new Error(response.message || "Failed to fetch area");
  }

  return response.data;
}

export async function createArea(
  payload: AreaPayload
): Promise<ApiResponse<Area>> {
  const response = await request<Area>("/areas/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to create area");
  }

  return response;
}

export async function updateArea(
  id: string,
  payload: AreaPayload
): Promise<ApiResponse<Area>> {
  const response = await request<Area>("/areas/update", {
    method: "POST",
    body: JSON.stringify({
      id,
      ...payload,
    }),
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to update area");
  }

  return response;
}

export async function deleteArea(
  id: string
): Promise<ApiResponse<Area>> {
  const response = await request<Area>(`/areas/delete/${id}`, {
    method: "POST",
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to delete area");
  }

  return response;
}


export async function getDrones(): Promise<Drone[]> {
  const response = await request<Drone[]>("/drones");

  if (!response.status || !response.data) {
    throw new Error(response.message || "Failed to fetch drones");
  }

  return response.data;
}

export async function getDrone(drone_id: string): Promise<Drone | null> {
  const path = `/drones/drone/${drone_id}`;

  console.log("GET DRONE PATH:", path);
  console.log("BASE URL:", baseUrl);

  const response = await request<Drone>(path);

  if (!response.status || !response.data) {
    throw new Error(response.message || "Failed to fetch drone");
  }

  return response.data;
}

export async function createDrone(
  payload: DronePayload
): Promise<ApiResponse<Drone>> {
  const response = await request<Drone>("/drones/create", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      cameraFeed: payload.cameraFeed || "",
    }),
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to create drone");
  }

  return response;
}

export async function updateDrone(
  id: string,
  payload: DronePayload
): Promise<ApiResponse<Drone>> {
  const response = await request<Drone>(`/drones/update/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to update drone");
  }

  return response;
}

export async function deleteDrone(
  id: string
): Promise<ApiResponse<Drone>> {
  const response = await request<Drone>(`/drones/delete/${id}`, {
    method: "POST",
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to delete drone");
  }

  return response;
}


export async function getSensors(): Promise<Sensor[]> {
  const response = await request<Sensor[]>("/sensors");

  if (!response.status || !response.data) {
    throw new Error(response.message || "Failed to fetch sensors");
  }

  return response.data;
}

export async function getSensor(id: string): Promise<Sensor | null> {
  const response = await request<Sensor>(`/sensors/${id}`);

  if (!response.status || !response.data) {
    throw new Error(response.message || "Failed to fetch sensor");
  }

  return response.data;
}

export async function createSensor(
  payload: SensorPayload
): Promise<ApiResponse<Sensor>> {
  const response = await request<Sensor>("/sensors/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to create sensor");
  }

  return response;
}

export async function updateSensor(
  id: string,
  payload: SensorPayload
): Promise<ApiResponse<Sensor>> {
  const response = await request<Sensor>(`/sensors/update/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to update sensor");
  }

  return response;
}

export async function deleteSensor(
  id: string
): Promise<ApiResponse<Sensor>> {
  const response = await request<Sensor>(`/sensors/delete/${id}`, {
    method: "POST",
  });

  if (!response.status) {
    throw new Error(response.message || "Failed to delete sensor");
  }

  return response;
}
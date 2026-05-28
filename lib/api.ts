import { baseUrl } from "@/lib/config";

export type ApiResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
  sensor?: T;
};

export type Area = {
  id: string;
  _id?: string;
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
};

export type Sensor = {
  id: string;
  name: string;
  sensor_id: string;
  area_id: string;
  latitude: number;
  longitude: number;
};

export type DronePayload = {
  name: string;
  drone_id: string;
  area_id: string;
  cameraFeed?: string;
};

export type SensorPayload = {
  name: string;
  sensor_id: string;
  area_id: string;
  latitude: number;
  longitude: number;
};

export type AreaPayload = {
  name: string;
  area_id: string;
};

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok && response.status !== 404) {
    throw new Error(body.message || "Request failed");
  }

  return body;
}

function getRecordId(record: { id?: string; _id?: string }) {
  return record.id || record._id || "";
}

export async function getDrones() {
  const response = await request<Drone[]>("/drones");
  return response.data || [];
}

export async function getDrone(id: string) {
  const drones = await getDrones();
  return drones.find((drone) => getRecordId(drone) === id) || null;
}

export async function createDrone(payload: DronePayload) {
  return request<Drone>("/drones/create", {
    method: "POST",
    body: JSON.stringify({ ...payload, cameraFeed: payload.cameraFeed || "" }),
  });
}

export async function updateDrone(id: string, payload: DronePayload) {
  return request<Drone>(`/drones/update/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteDrone(id: string) {
  return request<Drone>(`/drones/delete/${id}`, { method: "POST" });
}

export async function getSensors() {
  const response = await request<Sensor[]>("/sensors");
  return response.data || [];
}

export async function getSensor(id: string) {
  const sensors = await getSensors();
  return sensors.find((sensor) => getRecordId(sensor) === id) || null;
}

export async function createSensor(payload: SensorPayload) {
  return request<Sensor>("/sensors/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSensor(id: string, payload: SensorPayload) {
  return request<Sensor>(`/sensors/update/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteSensor(id: string) {
  return request<Sensor>(`/sensors/delete/${id}`, { method: "POST" });
}

export async function getAreas() {
  const response = await request<Area[]>("/areas");
  return response.data || [];
}

export async function getArea(id: string) {
  const response = await request<Area>(`/areas/area/${id}`);
  return response.data || null;
}

export async function createArea(payload: AreaPayload) {
  return request<Area>("/areas/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateArea(id: string, payload: AreaPayload) {
  return request<Area>("/areas/update", {
    method: "POST",
    body: JSON.stringify({ id, ...payload }),
  });
}

export async function deleteArea(id: string) {
  return request<Area>(`/areas/delete/${id}`, { method: "POST" });
}

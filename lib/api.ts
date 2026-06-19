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

const demoStorageKey = "nanodrone-crud-demo-state";
const requestTimeoutMs = 2500;

type DemoState = {
  areas: Area[];
  drones: Drone[];
  sensors: Sensor[];
};

const initialDemoAreas: Area[] = [
  { id: "area-demo-1", name: "North Zone", area_id: "AREA-001", drones: [] },
  { id: "area-demo-2", name: "South Zone", area_id: "AREA-002", drones: [] },
  { id: "area-demo-3", name: "Command Center", area_id: "AREA-003", drones: [] },
];

const initialDemoDrones: Drone[] = [
  {
    id: "drone-demo-1",
    name: "Scout Alpha",
    drone_id: "DRN-001",
    area_id: "AREA-001",
  },
  {
    id: "drone-demo-2",
    name: "Relay Bravo",
    drone_id: "DRN-002",
    area_id: "AREA-002",
  },
];

const initialDemoSensors: Sensor[] = [
  {
    id: "sensor-demo-1",
    name: "Temp Sensor North",
    sensor_id: "SNS-001",
    area_id: "AREA-001",
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    id: "sensor-demo-2",
    name: "Perimeter Sensor",
    sensor_id: "SNS-002",
    area_id: "AREA-003",
    latitude: 28.62,
    longitude: 77.215,
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function makeDemoState(): DemoState {
  return {
    areas: initialDemoAreas,
    drones: initialDemoDrones,
    sensors: initialDemoSensors,
  };
}

function readDemoState(): DemoState {
  if (!isBrowser()) return makeDemoState();

  try {
    const stored = window.localStorage.getItem(demoStorageKey);
    if (!stored) {
      const state = makeDemoState();
      writeDemoState(state);
      return state;
    }

    const parsed = JSON.parse(stored) as Partial<DemoState>;
    return {
      areas: parsed.areas?.length ? parsed.areas : initialDemoAreas,
      drones: parsed.drones?.length ? parsed.drones : initialDemoDrones,
      sensors: parsed.sensors?.length ? parsed.sensors : initialDemoSensors,
    };
  } catch {
    return makeDemoState();
  }
}

function writeDemoState(state: DemoState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(demoStorageKey, JSON.stringify(state));
}

function createDemoId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function withAreaDetails(drones: Drone[], areas: Area[]) {
  return drones.map((drone) => ({
    ...drone,
    area: areas.find((area) => area.area_id === drone.area_id),
  }));
}

function withDroneCounts(areas: Area[], drones: Drone[]) {
  return areas.map((area) => ({
    ...area,
    drones: drones.filter((drone) => drone.area_id === area.area_id),
  }));
}

function mergeByRecordId<T extends { id?: string; _id?: string }>(
  primary: T[],
  fallback: T[]
) {
  const seen = new Set(primary.map((item) => getRecordId(item)));
  return [...primary, ...fallback.filter((item) => !seen.has(getRecordId(item)))];
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    requestTimeoutMs
  );

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    signal: options?.signal || controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  }).finally(() => globalThis.clearTimeout(timeoutId));

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
  const demoState = readDemoState();

  try {
    const response = await request<Drone[]>("/drones");
    const drones = response.data?.length
      ? mergeByRecordId(response.data, demoState.drones)
      : demoState.drones;
    return withAreaDetails(drones, demoState.areas);
  } catch {
    return withAreaDetails(demoState.drones, demoState.areas);
  }
}

export async function getDrone(id: string) {
  const drones = await getDrones();
  return drones.find((drone) => getRecordId(drone) === id) || null;
}

export async function createDrone(payload: DronePayload) {
  try {
    await request<Drone>("/drones/create", {
      method: "POST",
      body: JSON.stringify({ ...payload, cameraFeed: payload.cameraFeed || "" }),
    });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const drone: Drone = { id: createDemoId("drone"), ...payload };
  writeDemoState({ ...state, drones: [...state.drones, drone] });
  return { status: true, message: "Drone saved to demo state", data: drone };
}

export async function updateDrone(id: string, payload: DronePayload) {
  try {
    await request<Drone>(`/drones/update/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const drone: Drone = { id, ...payload };
  writeDemoState({
    ...state,
    drones: state.drones.map((item) =>
      getRecordId(item) === id ? { ...item, ...drone } : item
    ),
  });
  return { status: true, message: "Drone updated in demo state", data: drone };
}

export async function deleteDrone(id: string) {
  try {
    await request<Drone>(`/drones/delete/${id}`, { method: "POST" });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const drone = state.drones.find((item) => getRecordId(item) === id);
  writeDemoState({
    ...state,
    drones: state.drones.filter((item) => getRecordId(item) !== id),
  });
  return { status: true, message: "Drone deleted from demo state", data: drone };
}

export async function getSensors() {
  const demoState = readDemoState();

  try {
    const response = await request<Sensor[]>("/sensors");
    return response.data?.length
      ? mergeByRecordId(response.data, demoState.sensors)
      : demoState.sensors;
  } catch {
    return demoState.sensors;
  }
}

export async function getSensor(id: string) {
  const sensors = await getSensors();
  return sensors.find((sensor) => getRecordId(sensor) === id) || null;
}

export async function createSensor(payload: SensorPayload) {
  try {
    await request<Sensor>("/sensors/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const sensor: Sensor = { id: createDemoId("sensor"), ...payload };
  writeDemoState({ ...state, sensors: [...state.sensors, sensor] });
  return { status: true, message: "Sensor saved to demo state", data: sensor };
}

export async function updateSensor(id: string, payload: SensorPayload) {
  try {
    await request<Sensor>(`/sensors/update/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const sensor: Sensor = { id, ...payload };
  writeDemoState({
    ...state,
    sensors: state.sensors.map((item) =>
      getRecordId(item) === id ? { ...item, ...sensor } : item
    ),
  });
  return { status: true, message: "Sensor updated in demo state", data: sensor };
}

export async function deleteSensor(id: string) {
  try {
    await request<Sensor>(`/sensors/delete/${id}`, { method: "POST" });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const sensor = state.sensors.find((item) => getRecordId(item) === id);
  writeDemoState({
    ...state,
    sensors: state.sensors.filter((item) => getRecordId(item) !== id),
  });
  return { status: true, message: "Sensor deleted from demo state", data: sensor };
}

export async function getAreas() {
  const demoState = readDemoState();

  try {
    const response = await request<Area[]>("/areas");
    const areas = response.data?.length
      ? mergeByRecordId(response.data, demoState.areas)
      : demoState.areas;
    return withDroneCounts(areas, demoState.drones);
  } catch {
    return withDroneCounts(demoState.areas, demoState.drones);
  }
}

export async function getArea(id: string) {
  try {
    const response = await request<Area>(`/areas/area/${id}`);
    if (response.data) return response.data;
  } catch {
    // Fall back to demo state below.
  }

  const areas = await getAreas();
  return areas.find((area) => getRecordId(area) === id) || null;
}

export async function createArea(payload: AreaPayload) {
  try {
    await request<Area>("/areas/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const area: Area = { id: createDemoId("area"), ...payload, drones: [] };
  writeDemoState({ ...state, areas: [...state.areas, area] });
  return { status: true, message: "Area saved to demo state", data: area };
}

export async function updateArea(id: string, payload: AreaPayload) {
  try {
    await request<Area>("/areas/update", {
      method: "POST",
      body: JSON.stringify({ id, ...payload }),
    });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const existing = state.areas.find((item) => getRecordId(item) === id);
  const previousAreaId = existing?.area_id;
  const area: Area = { id, ...payload, drones: existing?.drones || [] };
  writeDemoState({
    areas: state.areas.map((item) =>
      getRecordId(item) === id ? { ...item, ...area } : item
    ),
    drones: state.drones.map((drone) =>
      previousAreaId && drone.area_id === previousAreaId
        ? { ...drone, area_id: payload.area_id }
        : drone
    ),
    sensors: state.sensors.map((sensor) =>
      previousAreaId && sensor.area_id === previousAreaId
        ? { ...sensor, area_id: payload.area_id }
        : sensor
    ),
  });
  return { status: true, message: "Area updated in demo state", data: area };
}

export async function deleteArea(id: string) {
  try {
    await request<Area>(`/areas/delete/${id}`, { method: "POST" });
  } catch {
    // Demo state handles offline/API failures below.
  }

  const state = readDemoState();
  const area = state.areas.find((item) => getRecordId(item) === id);
  writeDemoState({
    ...state,
    areas: state.areas.filter((item) => getRecordId(item) !== id),
  });
  return { status: true, message: "Area deleted from demo state", data: area };
}

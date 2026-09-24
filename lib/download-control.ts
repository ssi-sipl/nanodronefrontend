type DownloadControl = {
  cancelled: boolean;
  paused: boolean;
};

const globalForDownloadControl = globalThis as unknown as {
  downloadRegistry?: Map<string, DownloadControl>;
};

const registry =
  globalForDownloadControl.downloadRegistry ??
  new Map<string, DownloadControl>();

globalForDownloadControl.downloadRegistry = registry;

export function registerDownload(mapId: string) {
  registry.set(mapId, {
    cancelled: false,
    paused: false,
  });

  console.log(
    "[download-control] REGISTER:",
    mapId,
    "registry:",
    [...registry.keys()]
  );
}

export function clearDownload(mapId: string) {
  console.log(
    "[download-control] CLEAR:",
    mapId,
    "before:",
    [...registry.keys()]
  );

  registry.delete(mapId);

  console.log(
    "[download-control] CLEAR after:",
    [...registry.keys()]
  );
}

export function requestCancel(mapId: string) {
  const entry = registry.get(mapId);

  if (entry) {
    entry.cancelled = true;
  }
}

export function setPaused(mapId: string, paused: boolean) {
  const entry = registry.get(mapId);

  if (entry) {
    entry.paused = paused;
  }
}

export function isCancelled(mapId: string) {
  return registry.get(mapId)?.cancelled ?? false;
}

export function isPaused(mapId: string) {
  return registry.get(mapId)?.paused ?? false;
}

export function isTracked(mapId: string) {
  const found = registry.has(mapId);

  console.log(
    "[download-control] TRACK CHECK:",
    JSON.stringify(mapId),
    "->",
    found,
    "| registry keys:",
    [...registry.keys()]
  );

  return found;
}
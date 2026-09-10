const MEDIAMTX_API_URL = process.env.MEDIAMTX_API_URL || "http://localhost:9997";

type RegisterPathOptions = {
  pathName: string;   // e.g. drone_id or sensor_id, must be URL-safe
  rtspUrl: string;
};

async function mediamtxRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${MEDIAMTX_API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  // MediaMTX returns 200/201 with empty body on success for most of these
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`MediaMTX API error (${res.status}): ${text}`);
  }
  return res;
}

/** Registers (or updates) a camera path in MediaMTX so it starts relaying the RTSP source on demand. */
export async function registerCameraPath({ pathName, rtspUrl }: RegisterPathOptions) {
  const body = {
    source: rtspUrl,
    sourceOnDemand: true,
  };

  try {
    // Try create first
    await mediamtxRequest("POST", `/v3/config/paths/add/${encodeURIComponent(pathName)}`, body);
  } catch (err) {
    // If it already exists, fall back to patch/update
    await mediamtxRequest("PATCH", `/v3/config/paths/patch/${encodeURIComponent(pathName)}`, body);
  }
}

/** Removes a camera path from MediaMTX (call on drone/sensor delete or when cameraFeed is cleared). */
export async function removeCameraPath(pathName: string) {
  await mediamtxRequest("DELETE", `/v3/config/paths/delete/${encodeURIComponent(pathName)}`);
}

/** Builds the browser-facing WebRTC (WHEP) viewer URL for a registered path. */
export function getWhepViewerUrl(pathName: string) {
  const host = (process.env.NEXT_PUBLIC_MEDIAMTX_WEBRTC_HOST || "http://localhost:8889").replace(/\/$/, "");
  return `${host}/${encodeURIComponent(pathName)}`;
}

/** Builds the raw WHEP endpoint used for the WebRTC SDP handshake (used by the player component). */
export function getWhepEndpoint(pathName: string) {
  return `${getWhepViewerUrl(pathName)}/whep`;
}
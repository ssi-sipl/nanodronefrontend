// lib/mgrs.ts
import * as mgrs from "mgrs";

/**
 * Convert latitude and longitude to MGRS string.
 * @param lat Latitude in decimal degrees
 * @param lng Longitude in decimal degrees
 * @param precision Optional precision (default: 5)
 * @returns MGRS string (e.g. "43QED1234567890")
 */
export function latLngToMGRS(lat: number, lng: number, precision: number = 5): string {
  try {
    return mgrs.forward([lng, lat], precision);
  } catch {
    return "";
  }
}

/**
 * Convert MGRS string to latitude and longitude.
 * @param mgrsString MGRS input string
 * @returns { lat, lng } or null if invalid
 */
export function mgrsToLatLng(mgrsString: string): { lat: number; lng: number } | null {
  try {
    const [lng, lat] = mgrs.toPoint(mgrsString.trim().toUpperCase());
    return { lat, lng };
  } catch {
    return null;
  }
}

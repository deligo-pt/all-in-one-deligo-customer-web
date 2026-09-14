/**
 * Google Maps in the browser, loaded when first needed (Phase 16).
 *
 * The key is referrer-restricted, which is why this never runs on the server:
 * the old app's server-side Distance Matrix proxy answered REQUEST_DENIED on
 * every call. Only the geocoder is used — typed address to coordinates, and
 * coordinates to a readable label.
 */
type LatLng = { lat: () => number; lng: () => number };
type GeocodeResult = { formatted_address: string; geometry: { location: LatLng } };
type Geocoder = {
  geocode: (request: {
    address?: string;
    location?: { lat: number; lng: number };
    language?: string;
  }) => Promise<{ results: GeocodeResult[] }>;
};
type MapsApi = {
  importLibrary: (name: "geocoding") => Promise<{ Geocoder: new () => Geocoder }>;
};

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
let loader: Promise<MapsApi> | null = null;

function loadMaps(locale: string): Promise<MapsApi> {
  const ready = () =>
    (window as unknown as { google?: { maps?: MapsApi } }).google?.maps;
  loader ??= new Promise<MapsApi>((resolve, reject) => {
    if (!KEY) return reject(new Error("maps-key-missing"));
    if (ready()?.importLibrary) return resolve(ready()!);
    const callback = `__deligoMaps${Date.now()}`;
    (window as unknown as Record<string, () => void>)[callback] = () =>
      resolve(ready()!);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&language=${locale}&loading=async&callback=${callback}`;
    script.async = true;
    script.addEventListener("error", () => {
      loader = null;
      reject(new Error("maps-blocked"));
    });
    document.head.appendChild(script);
  });
  return loader;
}

export type Geocoded = { latitude: number; longitude: number; label: string };

async function geocoder(locale: string): Promise<Geocoder> {
  const { Geocoder } = await (await loadMaps(locale)).importLibrary("geocoding");
  return new Geocoder();
}

/** A typed address, or `null` when Google finds nothing. */
export async function geocodeAddress(
  address: string,
  locale: string,
): Promise<Geocoded | null> {
  const { results } = await (
    await geocoder(locale)
  ).geocode({ address, language: locale });
  const top = results[0];
  return top
    ? {
        latitude: top.geometry.location.lat(),
        longitude: top.geometry.location.lng(),
        label: top.formatted_address,
      }
    : null;
}

/** A readable label for coordinates, or `null`. */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  locale: string,
): Promise<string | null> {
  try {
    const { results } = await (
      await geocoder(locale)
    ).geocode({ location: { lat: latitude, lng: longitude }, language: locale });
    return results[0]?.formatted_address ?? null;
  } catch {
    return null;
  }
}

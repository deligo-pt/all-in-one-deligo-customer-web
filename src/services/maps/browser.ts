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
type MapHandle = {
  getCenter: () => LatLng | undefined;
  addListener: (event: string, handler: () => void) => { remove: () => void };
  fitBounds: (bounds: BoundsHandle, padding?: number) => void;
  setCenter: (position: { lat: number; lng: number }) => void;
};
type BoundsHandle = { extend: (position: { lat: number; lng: number }) => void };
type PolylineOptions = {
  path: { lat: number; lng: number }[];
  map: MapHandle;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
};
type PolylineHandle = { setMap: (map: MapHandle | null) => void };
type MapOptions = {
  center: { lat: number; lng: number };
  zoom: number;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  clickableIcons?: boolean;
  gestureHandling?: string;
};
type MarkerOptions = {
  position: { lat: number; lng: number };
  map: MapHandle;
  title?: string;
};
type MarkerHandle = { setMap: (map: MapHandle | null) => void };
type MapsApi = {
  importLibrary: ((name: "geocoding") => Promise<{ Geocoder: new () => Geocoder }>) &
    ((name: "maps") => Promise<{
      Map: new (element: HTMLElement, options: MapOptions) => MapHandle;
      Polyline: new (options: PolylineOptions) => PolylineHandle;
    }>) &
    ((
      name: "marker",
    ) => Promise<{ Marker: new (options: MarkerOptions) => MarkerHandle }>) &
    ((name: "core") => Promise<{ LatLngBounds: new () => BoundsHandle }>);
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

/**
 * Waits for the map to actually paint.
 *
 * A key whose referrer allowlist does not include this origin answers
 * `RefererNotAllowedMapError` — which Google logs to the console and reports
 * nowhere our code can catch. The constructor resolves, no exception is
 * thrown, and the frame stays grey for ever. Measured twice: on a production
 * preview in Phase 20d, and again here on a second dev port.
 *
 * `tilesloaded` is the proof that a map exists. Nothing within ten seconds is
 * treated as a failure, so the caller can say so instead of showing a box.
 */
function painted(map: MapHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    const listener = map.addListener("tilesloaded", () => {
      clearTimeout(timer);
      listener.remove();
      resolve();
    });
    const timer = setTimeout(() => {
      listener.remove();
      reject(new Error("maps-blank"));
    }, 10_000);
  });
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

/** A mounted pin picker; `dispose` releases the map's listener. */
export type PinPicker = { dispose: () => void };

/**
 * The map pin picker (Phase 20b), the old app's `locationPicker`.
 *
 * The pin does not move — the map does, under a pin the caller draws in the
 * centre of the frame. That is one fewer library (no marker, and so no map id
 * to provision), it works the same under a finger and a mouse, and the thing
 * the customer is aiming at is always on screen.
 *
 * `onMove` fires when the map settles, not on every frame of a drag.
 */
export async function mountPinPicker(
  element: HTMLElement,
  start: { latitude: number; longitude: number },
  locale: string,
  onMove: (position: { latitude: number; longitude: number }) => void,
): Promise<PinPicker> {
  const { Map } = await (await loadMaps(locale)).importLibrary("maps");
  const map = new Map(element, {
    center: { lat: start.latitude, lng: start.longitude },
    zoom: 16,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: "greedy",
  });
  const listener = map.addListener("idle", () => {
    const center = map.getCenter();
    if (center) onMove({ latitude: center.lat(), longitude: center.lng() });
  });
  return { dispose: () => listener.remove() };
}

/**
 * The store on a map, with a pin on it (Phase 20d, second pass — the old app's
 * vendor details dialog).
 *
 * A real marker rather than the address form's centre-pin trick: there the
 * customer is choosing a point, here they are being shown one, and a pin that
 * slid around when they panned would be saying something false. The map itself
 * stays draggable and zoomable, because "where is this exactly" is usually
 * answered by looking at the street next to it.
 *
 * `Marker` is the classic one. `AdvancedMarkerElement` needs a cloud-configured
 * map id that this account does not have, and a map with no pin is worse than
 * a deprecation warning.
 */
export async function mountStoreMap(
  element: HTMLElement,
  place: { latitude: number; longitude: number; title?: string },
  locale: string,
): Promise<PinPicker> {
  const maps = await loadMaps(locale);
  const [{ Map }, { Marker }] = await Promise.all([
    maps.importLibrary("maps"),
    maps.importLibrary("marker"),
  ]);
  const position = { lat: place.latitude, lng: place.longitude };
  const map = new Map(element, {
    center: position,
    zoom: 15,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: "cooperative",
  });
  const marker = new Marker({ position, map, title: place.title });
  await painted(map);
  return { dispose: () => marker.setMap(null) };
}

/** One labelled point on the tracking map. */
export type TrackedPoint = {
  latitude: number;
  longitude: number;
  label?: string;
  /** The pin's colour — the brand pink for the rider, ink for the ends. */
  colour?: string;
};

/**
 * The order tracking map (Phase 20f) — the design's `live track` frame: the
 * route drawn between the two ends, a pin on each, and the rider's own pin
 * moving along it.
 *
 * The straight line is honest about what it is. A driving route would need the
 * Directions API — a second product, a second quota, and a road path the rider
 * may not be taking anyway. What the customer needs from this screen is where
 * their food is and roughly how far, and a line between the two answers that
 * without inventing a journey.
 *
 * The camera fits every point it was given, so an order with no rider yet
 * still frames the store and the door.
 */
export async function mountTrackingMap(
  element: HTMLElement,
  points: readonly TrackedPoint[],
  locale: string,
): Promise<PinPicker> {
  if (points.length === 0) throw new Error("tracking-no-points");
  const maps = await loadMaps(locale);
  const [{ Map }, { Marker }, { LatLngBounds }] = await Promise.all([
    maps.importLibrary("maps"),
    maps.importLibrary("marker"),
    maps.importLibrary("core"),
  ]);

  const positions = points.map((p) => ({ lat: p.latitude, lng: p.longitude }));
  const map = new Map(element, {
    center: positions[0]!,
    zoom: 14,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: "cooperative",
  });

  const markers = points.map(
    (point, index) =>
      new Marker({ position: positions[index]!, map, title: point.label }),
  );

  let line: PolylineHandle | null = null;
  if (positions.length > 1) {
    const { Polyline } = await maps.importLibrary("maps");
    // The route is drawn in the brand role, read from the stylesheet rather
    // than written here: a hex in this file is a colour that no longer has a
    // name and will not follow the token when it changes (`verify:design`).
    const brand = getComputedStyle(document.documentElement)
      .getPropertyValue("--dg-brand")
      .trim();
    line = new Polyline({
      path: positions,
      map,
      ...(brand ? { strokeColor: brand } : {}),
      strokeOpacity: 0.9,
      strokeWeight: 4,
    });
  }

  if (positions.length > 1) {
    const bounds = new LatLngBounds();
    positions.forEach((position) => bounds.extend(position));
    // 48px of padding, so a pin at the edge is not half under the frame.
    map.fitBounds(bounds, 48);
  }

  const handle = {
    dispose: () => {
      markers.forEach((marker) => marker.setMap(null));
      line?.setMap(null);
    },
  };
  try {
    await painted(map);
  } catch (error) {
    handle.dispose();
    throw error;
  }
  return handle;
}

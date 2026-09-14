/**
 * Where catalogue images come from (Phase 16), measured from the API's own
 * responses: `res.cloudinary.com` (categories, vendor photos) and
 * `storage-test.deligo.pt` (products, store photos — production will be
 * another `*.deligo.pt`).
 *
 * `next/image` **throws during render** for a host it is not configured for,
 * which took the listing down the first time real data arrived.
 *
 * `*.deligo.pt` is served unoptimised. On networks that reach it through
 * NAT64 its address falls in `64:ff9b::/96`, which the optimiser treats as
 * private and refuses (the old app found this). The files are already small
 * `.webp` uploads, so skipping the optimiser costs little.
 */
export const REMOTE_IMAGE_HOSTS = [
  { protocol: "https", hostname: "res.cloudinary.com" },
  { protocol: "https", hostname: "**.deligo.pt" },
] as const;

const UNOPTIMISED_SUFFIX = ".deligo.pt";

/**
 * Whether `next/image` should optimise this source. Local paths and known
 * hosts are optimised; `*.deligo.pt` and any host not in the list are not —
 * a plain image of an unknown host shows nothing, a thrown error takes the
 * page with it.
 */
export function shouldOptimiseImage(src: string): boolean {
  if (src.startsWith("/")) return true;
  let hostname: string;
  try {
    hostname = new URL(src).hostname;
  } catch {
    return false;
  }
  if (hostname.endsWith(UNOPTIMISED_SUFFIX)) return false;
  return REMOTE_IMAGE_HOSTS.some((host) => host.hostname === hostname);
}

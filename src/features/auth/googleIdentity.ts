/**
 * Google Identity Services, loaded on demand (ported from the old app).
 *
 * What `/auth/social-login` needs is the **ID token** — `credential` from
 * GIS's callback. GIS hands it only to its own rendered button or One Tap,
 * never to a click on ours, which is why the panel renders Google's button in
 * the design's Google slot (D-17). The language is fixed when the script loads
 * (`hl`), so a different locale reloads it — removing only
 * `window.google.accounts`, never `window.google`, which Maps shares.
 */
export type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "continue_with";
      shape: "rectangular";
      logo_alignment: "center";
      width: number;
      locale: string;
    },
  ) => void;
};

const OWNED = "data-deligo-gsi";

const readGis = () =>
  (window as unknown as { google?: { accounts?: { id?: GoogleIdApi } } }).google
    ?.accounts?.id;

let loader: Promise<GoogleIdApi> | null = null;
let loadedLocale: string | null = null;

export function loadGoogleIdentity(locale: string): Promise<GoogleIdApi> {
  if (loader && loadedLocale === locale) return loader;
  if (loader) {
    document.querySelectorAll(`script[${OWNED}]`).forEach((tag) => tag.remove());
    const g = (window as unknown as { google?: { accounts?: unknown } }).google;
    if (g?.accounts) delete g.accounts;
  }
  loadedLocale = locale;
  loader = new Promise<GoogleIdApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://accounts.google.com/gsi/client?hl=${encodeURIComponent(locale)}`;
    script.async = true;
    script.setAttribute(OWNED, "");
    script.addEventListener(
      "load",
      () => {
        const api = readGis();
        if (api) resolve(api);
        else reject(new Error("gsi-empty"));
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        loader = null;
        loadedLocale = null;
        reject(new Error("gsi-blocked"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });
  return loader;
}

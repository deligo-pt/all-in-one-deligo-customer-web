/**
 * The Facebook SDK, loaded by the panel before anyone presses the button:
 * `FB.login` opens a popup, and a popup opened after an `await` is no longer
 * the customer's click and is blocked. The token wanted is
 * `authResponse.accessToken`. Ported from the old app.
 */
type FacebookLoginResponse = {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: { accessToken?: string } | null;
};

export type FacebookApi = {
  init: (options: {
    appId: string;
    version: string;
    cookie?: boolean;
    xfbml?: boolean;
  }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options?: { scope?: string; auth_type?: string },
  ) => void;
};

/** Keep in step with the backend's verification calls. */
const GRAPH_VERSION = "v26.0";

const readFb = () => (window as unknown as { FB?: FacebookApi }).FB;

let loader: Promise<FacebookApi> | null = null;

export function loadFacebookSdk(appId: string, locale: string): Promise<FacebookApi> {
  if (loader) return loader;
  loader = new Promise<FacebookApi>((resolve, reject) => {
    if (!appId) return reject(new Error("facebook-app-id-missing"));
    const ready = () => {
      const api = readFb();
      if (!api) return reject(new Error("facebook-sdk-empty"));
      api.init({ appId, version: GRAPH_VERSION, cookie: false, xfbml: false });
      resolve(api);
    };
    if (readFb()) return ready();
    const script = document.createElement("script");
    script.src = `https://connect.facebook.net/${locale === "pt" ? "pt_PT" : "en_US"}/sdk.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", ready, { once: true });
    script.addEventListener(
      "error",
      () => {
        loader = null;
        reject(new Error("facebook-sdk-blocked"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });
  return loader;
}

/**
 * Opens Facebook's dialog — synchronously, inside the click. Resolves the
 * access token, `null` when the customer cancels (silence, not an error), and
 * rejects when the SDK is not there.
 */
export function facebookLogin(): Promise<string | null> {
  const api = readFb();
  if (!api) return Promise.reject(new Error("facebook-sdk-not-ready"));
  return new Promise((resolve) => {
    api.login(
      (response) =>
        resolve(
          response.status === "connected"
            ? (response.authResponse?.accessToken ?? null)
            : null,
        ),
      // `rerequest`: a customer who once declined email can be asked again —
      // otherwise every later attempt dies on SOCIAL_EMAIL_REQUIRED.
      { scope: "email,public_profile", auth_type: "rerequest" },
    );
  });
}

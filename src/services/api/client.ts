import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { normaliseFailure } from "@/lib/apiError";
import { ApiError } from "./error";

export { ApiError, isApiError } from "./error";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Retriable = InternalAxiosRequestConfig & { _retried?: boolean };

export function createApiClient(options: {
  getAccessToken: () => string | undefined;
  getLocale: () => string;
  /** Called once per request on a session-ending 401. Resolves `true` when a
   *  new access token is in place and the request should be repeated. */
  refresh?: () => Promise<boolean>;
  /** Called when a refresh could not save the session. */
  onSessionEnded?: () => void;
}): AxiosInstance {
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");

  const client = axios.create({ baseURL: BASE_URL, timeout: 15_000 });

  client.interceptors.request.use((config) => {
    const headers = AxiosHeaders.from(config.headers);
    const token = options.getAccessToken();
    if (token && !headers.has("Authorization"))
      headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Accept-Language"))
      headers.set("Accept-Language", options.getLocale());
    config.headers = headers;
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      // A 2xx that still says `success: false` is a failure with a 2xx status.
      const body = response.data as { success?: unknown } | undefined;
      if (body && typeof body === "object" && body.success === false) {
        throw new ApiError(
          normaliseFailure(response.status, body, options.getLocale()),
        );
      }
      return response;
    },
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) throw error;
      const locale = options.getLocale();
      if (!error.response) {
        throw new ApiError({ message: error.message, fields: [] }, true);
      }
      const failure = new ApiError(
        normaliseFailure(error.response.status, error.response.data, locale),
      );
      const config = error.config as Retriable | undefined;
      const hadSession = Boolean(config?.headers?.Authorization);

      if (
        failure.sessionEnded &&
        hadSession &&
        config &&
        !config._retried &&
        options.refresh
      ) {
        config._retried = true;
        if (await options.refresh()) {
          const headers = AxiosHeaders.from(config.headers);
          headers.delete("Authorization");
          config.headers = headers;
          return client.request(config);
        }
        options.onSessionEnded?.();
      }
      throw failure;
    },
  );

  return client;
}

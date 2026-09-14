import type { ApiFailure } from "@/lib/apiError";
import { isSessionEnded } from "@/lib/session";

/**
 * What every API request rejects with. Kept apart from the axios client so
 * code that only needs to recognise one does not download axios.
 *
 * Every rejection that leaves here is an `ApiError`: status, `errorKey`, the
 * server's sentence and its field errors. Callers branch on `errorKey`, never
 * on prose and never on a bare status.
 */
export class ApiError extends Error implements ApiFailure {
  readonly status?: number;
  readonly errorKey?: string;
  readonly fields: ApiFailure["fields"];
  /** No response at all — offline, timeout, CORS. */
  readonly network: boolean;

  constructor(failure: ApiFailure, network = false) {
    super(failure.message ?? failure.errorKey ?? "request-failed");
    this.name = "ApiError";
    this.status = failure.status;
    this.errorKey = failure.errorKey;
    this.fields = failure.fields;
    this.network = network;
  }

  get sessionEnded(): boolean {
    return isSessionEnded(this.status, this.errorKey);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

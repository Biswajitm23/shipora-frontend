/**
 * Fetch wrapper for the Shipora API.
 *
 * In the browser, requests go to the same origin and Next.js proxies /api/* to
 * Django (see next.config.ts). On the server they go straight to API_ORIGIN.
 * Every failure is thrown as an ApiError carrying a readable message.
 */

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Access token: in memory only; the auth layer (lib/auth.tsx) sets it.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// Called once when an authenticated request gets a 401 (expired access token).
// Returns a fresh access token, or null when the session can't be renewed.
let refreshHandler: (() => Promise<string | null>) | null = null;

export function setRefreshHandler(handler: (() => Promise<string | null>) | null): void {
  refreshHandler = handler;
}

function baseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_ORIGIN ?? "http://localhost:8000";
  }
  return "";
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Please check the details you entered.",
  401: "Please log in to continue.",
  403: "You don't have permission to do that.",
  404: "Not found.",
  429: "Too many requests. Please wait a moment and try again.",
};

function statusMessage(status: number): string {
  if (status >= 500) return "Something went wrong on the server. Please try again.";
  return STATUS_MESSAGES[status] ?? `Request failed (${status}).`;
}

/** Flatten DRF's error shapes into {"field": ["msg", ...]}. */
function flatten(value: unknown, prefix: string, out: FieldErrors): void {
  if (typeof value === "string") {
    (out[prefix] ??= []).push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => flatten(item, prefix, out));
  } else if (value && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) {
      flatten(inner, prefix ? `${prefix}.${key}` : key, out);
    }
  }
}

/** Map a DRF error body ({"detail"}, {"field": [...]}, non_field_errors) to an ApiError. */
export function toApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string") return new ApiError(detail, status);
  }

  const fieldErrors: FieldErrors = {};
  flatten(body, "", fieldErrors);
  const general = [...(fieldErrors[""] ?? []), ...(fieldErrors.non_field_errors ?? [])];
  delete fieldErrors[""];
  delete fieldErrors.non_field_errors;

  return new ApiError(general.join(" ") || statusMessage(status), status, fieldErrors);
}

type Method = "GET" | "POST" | "PATCH";

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  retried = false,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (response.status === 401 && accessToken && refreshHandler && !retried) {
    if (await refreshHandler()) return request<T>(method, path, body, true);
  }

  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = undefined;
    }
  }

  if (!response.ok) throw toApiError(response.status, data);
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
};

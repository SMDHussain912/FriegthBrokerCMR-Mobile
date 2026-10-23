/**
 * Typed API client for the FreightBrokerCMR backend deployed on Render.
 *
 * The mobile app talks to the backend DIRECTLY (it does not go through the
 * Next.js BFF), so the base URL is configured via `EXPO_PUBLIC_BACKEND_API_URL`
 * and the JWT is attached as a Bearer token on every authenticated request.
 */

export const BACKEND_API_URL = (
  process.env.EXPO_PUBLIC_BACKEND_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: any;

  constructor(message: string, { status = 500, code, payload }: { status?: number; code?: string; payload?: any } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

type ApiFetchOptions = {
  token?: string | null;
  init?: RequestInit;
};

/**
 * Perform a JSON request against the backend.
 * - Throws `ApiError` with a normalised message on any non-2xx response.
 * - Throws `ApiError` with status 503 when the backend is unreachable.
 */
export async function apiFetch(path: string, { token, init = {} }: ApiFetchOptions = {}): Promise<any> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${BACKEND_API_URL}${path}`, { ...init, headers });
  } catch (error) {
    throw new ApiError(
      "Cannot reach the FreightBrokerCMR API. Check EXPO_PUBLIC_BACKEND_API_URL and your connection.",
      { status: 503, code: "BACKEND_UNREACHABLE", payload: { cause: String(error) } }
    );
  }

  const text = await response.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(body?.error || `Request failed with status ${response.status}`, {
      status: response.status,
      code: body?.code,
      payload: body,
    });
  }

  return body;
}

/* ------------------------------------------------------------------ */
/* Domain models                                                        */
/* ------------------------------------------------------------------ */

export type Role = "broker" | "compliance_officer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export type LoadStatus = "POSTED" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface Load {
  _id: string;
  loadNumber: string;
  shipperName: string;
  origin: { city: string; state: string; pickupDate?: string | null };
  destination: { city: string; state: string; deliveryDate?: string | null };
  commodity: string;
  equipmentType: "DRY_VAN" | "REEFER" | "FLATBED";
  targetTemperature?: number | null;
  declaredCargoValue: number;
  status: LoadStatus;
  assignedCarrier?: { _id: string; legalName: string; dotNumber: string; mcNumber: string } | null;
  loadRequirements?: {
    minAuthorityAgeDays: number;
    minAutoLiability: number;
    requireReeferEndorsement: boolean;
    disallowConditionalSafety: boolean;
    maxUnsafeDrivingPercentile: number;
  };
  createdAt?: string;
}

export interface Carrier {
  _id: string;
  dotNumber: string;
  mcNumber: string;
  legalName: string;
  dbaName?: string;
  authorityStatus: "ACTIVE" | "REVOKED" | "INACTIVE" | "PENDING";
  safetyRating: "SATISFACTORY" | "CONDITIONAL" | "UNSATISFACTORY" | "NONE";
  overallStatus: "PASS" | "FAIL" | "NEEDS_REVIEW" | "UNKNOWN";
  contact?: { phone?: string; email?: string };
  fmcsaMetrics?: {
    unsafeDrivingPercentile: number;
    hosCompliancePercentile: number;
    vehicleMaintPercentile: number;
    crashTotal: number;
  };
}

/* ------------------------------------------------------------------ */
/* Typed endpoint helpers                                                */
/* ------------------------------------------------------------------ */

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch("/api/auth/login", {
      init: { method: "POST", body: JSON.stringify({ email, password }) },
    }),
  register: (name: string, email: string, password: string) =>
    apiFetch("/api/auth/register", {
      init: { method: "POST", body: JSON.stringify({ name, email, password }) },
    }),
  me: (token: string) => apiFetch("/api/auth/me", { token }),
};

export const loadsApi = {
  // Demo directory is public (no token required). Protected routes (load
  // detail, assignment, creation/editing) are handled separately below.
  list: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiFetch(`/api/loads${query}`);
  },
  get: (id: string, token: string) =>
    apiFetch(`/api/loads/${encodeURIComponent(id)}`, { token }),
  create: (load: Partial<Load>, token: string) =>
    apiFetch("/api/loads", {
      token,
      init: { method: "POST", body: JSON.stringify(load) },
    }),
  // Assignment contract (backend /:id/assign accepts { carrierId, overrideReason?, allowOverride }):
  // identity + role come from the verified JWT, never from a client role field.
  assign: (loadId: string, carrierId: string, overrideReason?: string, allowOverride?: boolean) =>
    apiFetch(`/api/loads/${encodeURIComponent(loadId)}/assign`, {
      init: {
        method: "POST",
        body: JSON.stringify({ carrierId, overrideReason, allowOverride }),
      },
    }),
  assignment: (loadId: string, token: string) =>
    apiFetch(`/api/loads/${encodeURIComponent(loadId)}/assignment`, { token }),
};

export const carriersApi = {
  // Demo carrier directory is public (no token required).
  list: (query?: string) => {
    const search = query ? `?query=${encodeURIComponent(query)}` : "";
    return apiFetch(`/api/carriers${search}`);
  },
  get: (id: string, token: string) =>
    apiFetch(`/api/carriers/${encodeURIComponent(id)}`, { token }),
};
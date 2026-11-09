/**
 * Shared typed API client for the Expo app.
 * The mobile client talks directly to the Express API and authenticates
 * protected endpoints with the JWT stored by AuthContext.
 */

const API_BASE_URL = (process.env.EXPO_PUBLIC_BACKEND_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export type EquipmentType = "DRY_VAN" | "REEFER" | "FLATBED";
export type LoadStatus = "POSTED" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface Carrier {
  _id: string;
  legalName: string;
  dbaName?: string;
  dotNumber: string;
  mcNumber: string;
  overallStatus: "PASS" | "FAIL" | "NEEDS_REVIEW" | "UNKNOWN";
  authorityStatus?: string;
  safetyRating?: string;
}

export interface Load {
  _id: string;
  loadNumber: string;
  shipperName: string;
  origin: { city: string; state: string; pickupDate?: string };
  destination: { city: string; state: string; deliveryDate?: string };
  commodity: string;
  equipmentType: EquipmentType;
  targetTemperature?: number;
  declaredCargoValue: number;
  status: LoadStatus;
  assignedCarrier?: Carrier | null;
  createdAt?: string;
  updatedAt?: string;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "Backend URL is missing. Set EXPO_PUBLIC_BACKEND_API_URL in the Expo build environment.",
      0,
      "BACKEND_URL_MISSING"
    );
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("Cannot reach the FreightBrokerCMR backend. Check your connection and try again.", 503, "BACKEND_UNREACHABLE");
  }

  const raw = await response.text();
  let payload: any = null;
  if (raw) {
    try { payload = JSON.parse(raw); }
    catch { payload = { error: raw }; }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error || payload?.message || `Request failed (${response.status})`,
      response.status,
      payload?.code
    );
  }
  return payload as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  register: (name: string, email: string, password: string) =>
    request<{ success: boolean; token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),
  me: (token: string) =>
    request<{ success: boolean; user: User }>("/api/auth/me", { token }),
};

export const loadsApi = {
  list: (status?: string, token?: string | null) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<{ success: boolean; loads: Load[] }>(`/api/loads${query}`, { token });
  },
  create: (load: Partial<Load>, token: string) =>
    request<{ success: boolean; load: Load }>("/api/loads", { method: "POST", body: load, token }),
  get: (id: string, token: string) =>
    request<{ success: boolean; load: Load }>(`/api/loads/${encodeURIComponent(id)}`, { token }),
  assign: (id: string, carrierId: string, token: string) =>
    request<{ success: boolean; assignment?: { carrierName?: string } }>(
      `/api/loads/${encodeURIComponent(id)}/assign`,
      { method: "POST", body: { carrierId }, token }
    ),
};

export const carriersApi = {
  list: (query?: string) => {
    const params = query ? `?query=${encodeURIComponent(query)}` : "";
    return request<{ success: boolean; carriers: Carrier[] }>(`/api/carriers${params}`);
  },
};

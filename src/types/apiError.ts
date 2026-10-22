export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  details?: Record<string, unknown> | string[] | string | null;
  path?: string;
}

export interface ApiErrorInfo {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message: string;
  details: Array<{ field: string; message: string }>;
  path?: string;
}

export function normalizeApiError(
  payload: unknown,
  fallback: string,
  httpStatus?: number,
): ApiErrorInfo {
  if (!payload || typeof payload !== "object") {
    return { message: fallback, status: httpStatus, details: [] };
  }
  const data = payload as ApiErrorResponse;
  const details: Array<{ field: string; message: string }> = [];
  if (
    data.details &&
    typeof data.details === "object" &&
    !Array.isArray(data.details)
  ) {
    Object.entries(data.details).forEach(([field, value]) =>
      details.push({ field, message: String(value) }),
    );
  } else if (Array.isArray(data.details)) {
    data.details.forEach((value, index) =>
      details.push({ field: `detail ${index + 1}`, message: String(value) }),
    );
  } else if (typeof data.details === "string") {
    details.push({ field: "details", message: data.details });
  }
  return {
    timestamp: data.timestamp,
    status: data.status ?? httpStatus,
    error: data.error,
    code: data.code,
    message: data.message || data.error || fallback,
    details,
    path: data.path,
  };
}

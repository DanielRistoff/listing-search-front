import { normalizeApiError, type ApiErrorInfo } from "../types/apiError";
import type { ListingFilters, ListingSearchResponse } from "../types/listing";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/+$/, "");

export class ListingApiError extends Error {
  readonly info: ApiErrorInfo;
  constructor(info: ApiErrorInfo) {
    super(info.message);
    this.name = "ListingApiError";
    this.info = info;
  }
}

function addParam(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value !== undefined && String(value).trim() !== "")
    params.set(key, String(value));
}

export async function searchListings(
  filters: ListingFilters,
  page: number,
  signal?: AbortSignal,
): Promise<ListingSearchResponse> {
  const params = new URLSearchParams();

  addParam(params, "keyword", filters.keyword);
  addParam(params, "city", filters.city);
  addParam(params, "minPrice", filters.minPrice);
  addParam(params, "maxPrice", filters.maxPrice);
  addParam(params, "minBedrooms", filters.minBedrooms);
  addParam(params, "source", filters.source);
  addParam(params, "page", page);
  addParam(params, "pageSize", filters.pageSize);

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/api/listings?${params.toString()}`,
      {
        headers: { Accept: "application/json" },
        signal,
      },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ListingApiError({
      message:
        "Unable to connect to the server. Check your connection and try again.",
      details: [],
    });
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ListingApiError(
      normalizeApiError(
        payload,
        `The request failed with status ${response.status}.`,
        response.status,
      ),
    );
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray((payload as ListingSearchResponse).results)
  ) {
    throw new ListingApiError({
      message: "The server returned an unexpected response format.",
      status: response.status,
      details: [],
    });
  }
  return payload as ListingSearchResponse;
}

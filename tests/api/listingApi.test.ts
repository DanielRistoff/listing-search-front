import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ListingApiError, searchListings } from "../../src/api/listingApi";

import type {
  ListingFilters,
  ListingSearchResponse,
} from "../../src/types/listing";

describe("ListingApiError", () => {
  it("should create an error with the provided message and info", () => {
    const info = {
      message: "Invalid request",
      status: 400,
      details: [],
    };

    const error = new ListingApiError(info);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ListingApiError");
    expect(error.message).toBe("Invalid request");
    expect(error.info).toEqual(info);
  });
});

describe("searchListings", () => {
  const filters = {
    keyword: "",
    city: "",
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    source: "",
    pageSize: 10,
  } as ListingFilters;

  const validResponse = {
    results: [],
    page: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  } as ListingSearchResponse;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function mockResponse(
    body: unknown,
    status = 200,
    ok = status >= 200 && status < 300,
  ) {
    return {
      ok,
      status,
      json: vi.fn().mockResolvedValue(body),
    } as unknown as Response;
  }

  it("should return listings when the API responds successfully", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(validResponse));

    const result = await searchListings(filters, 0);

    expect(result).toEqual(validResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should send the expected URL and Accept header", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(validResponse));

    await searchListings(filters, 0);

    const [url, options] = vi.mocked(fetch).mock.calls[0];

    expect(url).toContain("/api/listings?");
    expect(url).toContain("page=0");
    expect(url).toContain("pageSize=10");
    expect(options?.headers).toEqual({
      Accept: "application/json",
    });
  });

  it("should include provided filters in the query string", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(validResponse));

    const customFilters = {
      ...filters,
      keyword: "house",
      city: "Orlando",
      minPrice: "200000",
      maxPrice: "500000",
      minBedrooms: "3",
      source: "MLS_A",
    } as ListingFilters;

    await searchListings(customFilters, 2);

    const [url] = vi.mocked(fetch).mock.calls[0];
    const parsedUrl = new URL(String(url));

    expect(parsedUrl.searchParams.get("keyword")).toBe("house");
    expect(parsedUrl.searchParams.get("city")).toBe("Orlando");
    expect(parsedUrl.searchParams.get("minPrice")).toBe("200000");
    expect(parsedUrl.searchParams.get("maxPrice")).toBe("500000");
    expect(parsedUrl.searchParams.get("minBedrooms")).toBe("3");
    expect(parsedUrl.searchParams.get("source")).toBe("MLS_A");
    expect(parsedUrl.searchParams.get("page")).toBe("2");
    expect(parsedUrl.searchParams.get("pageSize")).toBe("10");
  });

  it("should omit empty and undefined query parameters", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(validResponse));

    await searchListings(filters, 0);

    const [url] = vi.mocked(fetch).mock.calls[0];
    const parsedUrl = new URL(String(url));

    expect(parsedUrl.searchParams.has("keyword")).toBe(false);
    expect(parsedUrl.searchParams.has("city")).toBe(false);
    expect(parsedUrl.searchParams.has("minPrice")).toBe(false);
    expect(parsedUrl.searchParams.has("maxPrice")).toBe(false);
    expect(parsedUrl.searchParams.has("minBedrooms")).toBe(false);
    expect(parsedUrl.searchParams.has("source")).toBe(false);
  });

  it("should pass the abort signal to fetch", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse(validResponse));

    const controller = new AbortController();

    await searchListings(filters, 0, controller.signal);

    const [, options] = vi.mocked(fetch).mock.calls[0];

    expect(options?.signal).toBe(controller.signal);
  });

  it("should throw ListingApiError when the server returns HTTP 400", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse(
        {
          status: 400,
          error: "Bad Request",
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: {
            page: "Page must be a valid integer.",
          },
        },
        400,
        false,
      ),
    );

    await expect(searchListings(filters, 0)).rejects.toMatchObject({
      name: "ListingApiError",
      info: {
        status: 400,
      },
    });
  });

  it("should throw ListingApiError when the server returns HTTP 500", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ message: "Internal Server Error" }, 500, false),
    );

    await expect(searchListings(filters, 0)).rejects.toMatchObject({
      name: "ListingApiError",
      info: {
        status: 500,
      },
    });
  });

  it("should handle an HTTP error with an invalid JSON body", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: vi.fn().mockRejectedValue(new SyntaxError("Invalid JSON")),
    } as unknown as Response);

    await expect(searchListings(filters, 0)).rejects.toMatchObject({
      name: "ListingApiError",
      info: {
        status: 502,
      },
    });
  });

  it("should throw ListingApiError when the server returns invalid data", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({
        page: 0,
        totalElements: 0,
      }),
    );

    await expect(searchListings(filters, 0)).rejects.toMatchObject({
      name: "ListingApiError",
      message: "The server returned an unexpected response format.",
    });
  });

  it("should reject when the successful response is not valid JSON", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError("Invalid JSON")),
    } as unknown as Response);

    await expect(searchListings(filters, 0)).rejects.toMatchObject({
      name: "ListingApiError",
      message: "The server returned an unexpected response format.",
    });
  });

  it("should handle network errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Network failure"));

    await expect(searchListings(filters, 0)).rejects.toMatchObject({
      name: "ListingApiError",
      message:
        "Unable to connect to the server. Check your connection and try again.",
      info: {
        details: [],
      },
    });
  });

  it("should preserve AbortError when the request is cancelled", async () => {
    const abortError = new DOMException(
      "The request was aborted",
      "AbortError",
    );

    vi.mocked(fetch).mockRejectedValue(abortError);

    await expect(searchListings(filters, 0)).rejects.toBe(abortError);
  });
});

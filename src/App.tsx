import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
} from "lucide-react";
import { searchListings, ListingApiError } from "./api/listingApi";
import { ErrorMessage } from "./components/ErrorMessage";
import { ListingCard } from "./components/ListingCard";
import { normalizeApiError, type ApiErrorInfo } from "./types/apiError";
import type { ListingFilters, ListingSearchResponse } from "./types/listing";

const defaultFilters: ListingFilters = {
  keyword: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  source: "",
  pageSize: 3,
};

export default function App() {
  const [draft, setDraft] = useState<ListingFilters>(defaultFilters);
  const [filters, setFilters] = useState<ListingFilters>(defaultFilters);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ListingSearchResponse | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const hasPriceRangeError =
    draft.minPrice !== "" &&
    draft.maxPrice !== "" &&
    Number(draft.minPrice) > Number(draft.maxPrice);

  const loadListings = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const result = await searchListings(filters, page, signal);
        setData(result);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError")
          return;
        setError(
          caught instanceof ListingApiError
            ? caught.info
            : normalizeApiError(
                caught,
                "Something went wrong. Please try again.",
              ),
        );
        setData(null);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [filters, page, retryKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadListings(controller.signal);
    return () => controller.abort();
  }, [loadListings]);

  const update = (key: keyof ListingFilters, value: string | number) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setFilters({ ...draft });
  };
  const resetFilters = () => {
    setDraft(defaultFilters);
    setFilters(defaultFilters);
    setPage(0);
  };
  const retry = () => setRetryKey((value) => value + 1);
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const formatCurrency = (value: string) => {
    if (!value) return "";

    const numericValue = value.replace(/\D/g, "");

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(numericValue));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <Building2 size={21} />
          </span>
          <span>
            Listing<span className="brand-accent">Search</span>
          </span>
        </a>
        <span className="topbar-label">PROPERTY SEARCH</span>
      </header>
      <main id="top" className="main-content">
        <section className="hero">
          <div className="hero-icon">
            <Home size={22} />
          </div>
          <p className="eyebrow">FIND YOUR NEXT HOME</p>
          <h1>
            Discover a place
            <br className="desktop-break" /> to call <span>home.</span>
          </h1>
          <p className="hero-subtitle">
            Search listings from multiple sources and find the right place for
            your next chapter.
          </p>
          <form className="quick-search" onSubmit={applyFilters}>
            <Search size={19} />
            <input
              aria-label="Search listings"
              placeholder="Search by keywords..."
              value={draft.keyword}
              onChange={(e) => update("keyword", e.target.value)}
            />
            <button className="button button-primary" type="submit">
              Search
            </button>
          </form>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR SEARCH</p>
              <h2>Property listings</h2>
              <p className="muted">
                {loading
                  ? "Finding properties..."
                  : `${total.toLocaleString("en-US")} ${total === 1 ? "property" : "properties"} found`}
              </p>
            </div>
            <button
              className="button button-secondary filter-toggle"
              onClick={() => setShowFilters((value) => !value)}
            >
              <SlidersHorizontal size={16} />{" "}
              {showFilters ? "Hide filters" : "Show filters"}
            </button>
          </div>

          {showFilters && (
            <form className="filter-panel" onSubmit={applyFilters}>
              <div className="filter-panel-heading">
                <div>
                  <SlidersHorizontal size={17} />
                  <h3>Refine your search</h3>
                </div>
                <button
                  type="button"
                  className="text-button"
                  onClick={resetFilters}
                >
                  <RotateCcw size={14} /> Reset all
                </button>
              </div>
              <div className="filter-grid">
                <label>
                  Minimum price ($)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(draft.minPrice)}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      update("minPrice", numericValue);
                    }}
                    placeholder="No minimum"
                    aria-invalid={
                      draft.minPrice !== "" &&
                      draft.maxPrice !== "" &&
                      Number(draft.minPrice) > Number(draft.maxPrice)
                    }
                  />
                  {draft.minPrice !== "" &&
                    draft.maxPrice !== "" &&
                    Number(draft.minPrice) > Number(draft.maxPrice) && (
                      <span className="error-message" role="alert">
                        Minimum price must be less than or equal to maximum
                        price.
                      </span>
                    )}
                </label>

                <label>
                  Maximum price ($)
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(draft.maxPrice)}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      update("maxPrice", numericValue);
                    }}
                    placeholder="No maximum"
                    aria-invalid={
                      draft.minPrice !== "" &&
                      draft.maxPrice !== "" &&
                      Number(draft.minPrice) > Number(draft.maxPrice)
                    }
                  />
                  {draft.minPrice !== "" &&
                    draft.maxPrice !== "" &&
                    Number(draft.minPrice) > Number(draft.maxPrice) && (
                      <span className="error-message" role="alert">
                        Maximum price must be greater than or equal to minimum
                        price.
                      </span>
                    )}
                </label>
                <label>
                  Min. bedrooms
                  <select
                    value={draft.minBedrooms}
                    onChange={(e) => update("minBedrooms", e.target.value)}
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                        {n === 6 ? "+" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  City
                  <input
                    value={draft.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="e.g. Springfield"
                  />
                </label>
                <label>
                  Results per page
                  <select
                    value={draft.pageSize}
                    onChange={(e) => update("pageSize", Number(e.target.value))}
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                  </select>
                </label>
              </div>
              <div className="filter-actions">
                <span className="muted">
                  <MapPin size={14} /> Search across available listings
                </span>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={hasPriceRangeError}
                >
                  <Search size={16} /> Apply filters
                </button>
              </div>
            </form>
          )}

          {error && <ErrorMessage error={error} onRetry={retry} />}
          {!error && loading && (
            <div className="loading-state">
              <span className="spinner" />
              <p>Loading property listings...</p>
            </div>
          )}
          {!error && !loading && data && data.results.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Home size={25} />
              </div>
              <h3>No properties found</h3>
              <p>Try changing your search terms or removing some filters.</p>
              <button
                className="button button-secondary"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            </div>
          )}
          {!error && !loading && data && data.results.length > 0 && (
            <>
              <div className="results-toolbar">
                <span>
                  Showing{" "}
                  <strong>
                    {data.page * data.pageSize + 1}–
                    {Math.min(
                      (data.page + 1) * data.pageSize,
                      data.totalElements,
                    )}
                  </strong>{" "}
                  of <strong>{data.totalElements}</strong>
                </span>
                <span>
                  Page {data.page + 1} of {Math.max(data.totalPages, 1)}
                </span>
              </div>
              <div className="listing-grid">
                {data.results.map((item) => (
                  <ListingCard
                    key={`${item.listing.source}-${item.listing.id}`}
                    result={item}
                  />
                ))}
              </div>
              <nav className="pagination" aria-label="Pagination">
                <button
                  className="button button-secondary page-button"
                  disabled={page <= 0 || loading}
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="page-count">
                  Page <strong>{(data.page ?? page) + 1}</strong> of{" "}
                  <strong>{Math.max(data.totalPages, 1)}</strong>
                </span>
                <button
                  className="button button-secondary page-button"
                  disabled={page + 1 >= totalPages || loading}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              </nav>
            </>
          )}
        </section>
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Listing Search</span>
        <span>Property search</span>
      </footer>
    </div>
  );
}

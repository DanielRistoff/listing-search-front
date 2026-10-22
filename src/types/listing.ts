export interface Listing {
  id: string;
  source: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  latitude: number;
  longitude: number;
  listedDate: string;
  status: string;
  description: string;
}

export interface ListingResult {
  listing: Listing;
  relevanceScore: number;
}

export interface ListingSearchResponse {
  results: ListingResult[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ListingFilters {
  keyword: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  source: string;
  pageSize: number;
}

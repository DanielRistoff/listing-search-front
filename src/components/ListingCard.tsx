import {
  BedDouble,
  Bath,
  MapPin,
  Ruler,
  CalendarDays,
  Star,
} from "lucide-react";
import type { ListingResult } from "../types/listing";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ListingCard({ result }: { result: ListingResult }) {
  const { listing } = result;
  return (
    <article className="listing-card">
      <div className="listing-card-top">
        <span className="source-pill">{listing.source}</span>
        <span className={`status-pill ${listing.status.toLowerCase()}`}>
          {listing.status}
        </span>
      </div>
      <div className="listing-price">{money.format(listing.price)}</div>
      <h3>{listing.address}</h3>
      <p className="listing-location">
        <MapPin size={15} /> {listing.city}, {listing.state} {listing.zip}
      </p>
      <div className="listing-stats">
        <span>
          <BedDouble size={17} /> {listing.bedrooms} beds
        </span>
        <span>
          <Bath size={17} /> {listing.bathrooms} baths
        </span>
        <span>
          <Ruler size={17} /> {listing.sqft.toLocaleString("en-US")} sqft
        </span>
      </div>
      <p className="listing-description">
        {listing.description || "No description provided."}
      </p>
      <div className="listing-footer">
        <span>
          <CalendarDays size={14} /> Listed {listing.listedDate}
        </span>
        <span className="relevance">
          <Star size={14} /> {result.relevanceScore.toFixed(2)} relevance
        </span>
      </div>
    </article>
  );
}

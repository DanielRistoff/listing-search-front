import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { ListingCard } from "../../src/components/ListingCard";
import type { ListingResult } from "../../src/types/listing";

afterEach(() => {
  cleanup();
});

describe("ListingCard", () => {
  const result: ListingResult = {
    listing: {
      id: "A5",
      source: "MLS_A",
      address: "55 Elm Ct",
      city: "Vienna",
      state: "VA",
      zip: "22180",
      price: 470000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1300,
      latitude: 38.9012,
      longitude: -77.2653,
      listedDate: "2026-09-04",
      status: "active",
      description: "Quiet cul-de-sac, walkable to Metro. No pets.",
    },
    relevanceScore: 94.85,
  };

  it("should render the property address and source", () => {
    render(<ListingCard result={result} />);

    expect(
      screen.getByRole("heading", { name: "55 Elm Ct" }),
    ).toBeInTheDocument();

    expect(screen.getByText("MLS_A")).toBeInTheDocument();
  });

  it("should format the price as USD without decimal places", () => {
    render(<ListingCard result={result} />);

    expect(screen.getByText("$470,000")).toBeInTheDocument();
  });

  it("should render the property location", () => {
    render(<ListingCard result={result} />);

    expect(screen.getByText("Vienna, VA 22180")).toBeInTheDocument();
  });

  it("should render the property status", () => {
    render(<ListingCard result={result} />);

    const status = screen.getByText("active");

    expect(status).toBeInTheDocument();
    expect(status).toHaveClass("active");
  });

  it("should render the number of bedrooms, bathrooms, and square feet", () => {
    render(<ListingCard result={result} />);

    expect(screen.getByText("3 beds")).toBeInTheDocument();
    expect(screen.getByText("2 baths")).toBeInTheDocument();
    expect(screen.getByText("1,300 sqft")).toBeInTheDocument();
  });

  it("should render the property description", () => {
    render(<ListingCard result={result} />);

    expect(
      screen.getByText("Quiet cul-de-sac, walkable to Metro. No pets."),
    ).toBeInTheDocument();
  });

  it("should display a fallback when the description is empty", () => {
    const resultWithoutDescription: ListingResult = {
      ...result,
      listing: {
        ...result.listing,
        description: "",
      },
    };

    render(<ListingCard result={resultWithoutDescription} />);

    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  it("should render the listing date", () => {
    render(<ListingCard result={result} />);

    expect(screen.getByText("Listed 2026-09-04")).toBeInTheDocument();
  });

  it("should format the relevance score to two decimal places", () => {
    render(<ListingCard result={result} />);

    expect(screen.getByText("94.85 relevance")).toBeInTheDocument();
  });

  it("should render the card as an article", () => {
    render(<ListingCard result={result} />);

    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});

# Listing Search UI

A React + TypeScript + Vite frontend for searching and displaying property listings from a Java + Spring Boot backend API. All user-facing interface text is in English.

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- React Testing Library
- jsdom
- Lucide React
- Java
- Spring Boot

## Requirements

- Node.js 24.18.0+
- npm
- Backend API available at `http://localhost:8080` by default

The project should use a Node.js version compatible with the requirements above. Check your installed version with `node -v`.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the Vite URL displayed in the terminal, usually:

`http://localhost:5173`

## Environment Configuration

Configure the backend URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

If the backend runs at a different address, update this value.

Ensure the backend CORS configuration allows requests from the Vite development origin.

Do not commit environment files containing secrets.

## Available Scripts

| Command            | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| `npm run dev`      | Starts the Vite development server                            |
| `npm run build`    | Runs TypeScript project checks and creates a production build |
| `npm run preview`  | Serves the production build locally                           |
| `npm test`         | Starts Vitest in watch mode                                   |
| `npm run test:run` | Runs all tests once                                           |

## Testing

The project uses Vitest, React Testing Library, jsdom, and `@testing-library/jest-dom/vitest`.

Test files are located under `tests/` and use the `.test.ts` or `.test.tsx` extensions.

### Run all tests

```bash
npm run test:run
```

### Run a specific test file

```bash
npx vitest run tests/components/ErrorMessage.test.tsx
```

```bash
npx vitest run tests/components/ListingCard.test.tsx
```

### Run a specific test by name

```bash
npx vitest run tests/components/ListingCard.test.tsx -t "should render the property location"
```

## Main Components

### ListingCard

Displays property information, including:

- Listing source and status
- Price formatted as US dollars without decimal places
- Address and location
- Bedrooms, bathrooms, and square footage
- Property description, with a fallback when empty
- Listing date
- Relevance score formatted to two decimal places

### ErrorMessage

Displays API errors with accessible alert semantics and optional metadata, including:

- Error title and message
- HTTP status
- Error code
- Request path
- Timestamp
- Validation details
- Retry action

The component uses a default title when the error title is missing and omits optional metadata when it is unavailable.

## API Contract

The frontend requests:

```http
GET /api/listings
```

### Successful Response

The API returns a paginated response containing `results`, `page`, `pageSize`, `totalElements`, and `totalPages`.

Example:

```json
{
  "results": [
    {
      "listing": {
        "id": "A5",
        "source": "MLS_A",
        "address": "55 Elm Ct",
        "city": "Springfield",
        "state": "VA",
        "zip": "22180",
        "price": 470000,
        "bedrooms": 3,
        "bathrooms": 2,
        "sqft": 1300,
        "latitude": 38.9012,
        "longitude": -77.2653,
        "listedDate": "2026-09-04",
        "status": "active",
        "description": "Quiet cul-de-sac, walkable to Metro. No pets."
      },
      "relevanceScore": 94.85
    }
  ],
  "page": 0,
  "pageSize": 10,
  "totalElements": 12,
  "totalPages": 2
}
```

### Error Response

The frontend's error handling supports error metadata and field-level validation details.

Example:

```json
{
  "timestamp": "2026-10-22T04:39:17.785896Z",
  "status": 400,
  "error": "Bad Request",
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "page": "Page must be a valid integer."
  },
  "path": "/api/listings"
}
```

The exact response structure must match the backend implementation and the frontend's `ApiErrorInfo` type.

## Query Parameters

The frontend currently sends these query parameters:

- `keyword`
- `city`
- `minPrice`
- `maxPrice`
- `minBedrooms`
- `source`
- `pageSize`

Confirm these names against the backend controller. If the backend uses different names, update `src/api/listingApi.ts`.

The backend must implement each filter for it to affect the returned results.

## Production Build

Create the production build:

```bash
npm run build
```

Preview the build locally:

```bash
npm run preview
```

## Project Structure

```text
listing-search-front/
├── src/
│   ├── api/
│   │   └── listingApi.ts
│   ├── components/
│   │   ├── ErrorMessage.tsx
│   │   └── ListingCard.tsx
│   └── types/
│       ├── apiError.ts
│       └── listing.ts
├── tests/
│   └── components/
│       ├── ErrorMessage.test.tsx
│       └── ListingCard.test.tsx
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

This is a representative structure; additional files may exist in the project.

## Troubleshooting

### API Connection Issues

- Verify that the backend is running.
- Confirm `VITE_API_BASE_URL` in `.env`.
- Check the browser console and network requests.
- Verify that the backend permits the frontend origin through CORS.

### Test Failures

Run a failing test individually to isolate the issue, then run the entire test file to check for interactions between tests.

```bash
npx vitest run tests/components/ErrorMessage.test.tsx --reporter=verbose
```

```bash
npx vitest run tests/components/ListingCard.test.tsx --reporter=verbose
```

If individual tests pass but a complete test file fails, inspect the first assertion failure, test setup, DOM cleanup, shared mocks, and test configuration.

### Node.js Version

Check the active Node.js and npm versions:

```bash
node -v
npm -v
```

If you want to pin a specific Node.js version for the project, verify the installed version and configure the `engines` field in `package.json` accordingly.

## License

Add the applicable project license before distributing the application.

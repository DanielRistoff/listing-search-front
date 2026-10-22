import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ApiErrorInfo } from "../types/apiError";

export function ErrorMessage({
  error,
  onRetry,
}: {
  error: ApiErrorInfo;
  onRetry: () => void;
}) {
  return (
    <section className="error-panel" role="alert" aria-live="assertive">
      <div className="error-icon">
        <AlertTriangle size={22} />
      </div>
      <div className="error-content">
        <h2>{error.error || "Request failed"}</h2>
        <p className="error-message">{error.message}</p>
        <div className="error-meta">
          {error.status !== undefined && (
            <span>
              <b>HTTP status:</b> {error.status}
            </span>
          )}
          {error.code && (
            <span>
              <b>Code:</b> {error.code}
            </span>
          )}
          {error.path && (
            <span>
              <b>Path:</b> <code>{error.path}</code>
            </span>
          )}
        </div>
        {error.details.length > 0 && (
          <div className="error-details">
            <h3>Details</h3>
            <ul>
              {error.details.map((item, index) => (
                <li key={`${item.field}-${index}`}>
                  <strong>{item.field}:</strong> {item.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        {error.timestamp && (
          <p className="error-timestamp">Timestamp: {error.timestamp}</p>
        )}
        <button
          className="button button-secondary retry-button"
          onClick={onRetry}
        >
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    </section>
  );
}

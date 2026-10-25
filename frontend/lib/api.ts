export function apiBaseUrl() {
  // Browser requests stay on the frontend origin so the auth cookie belongs
  // to the same host as the dashboard. Next.js rewrites proxy them to the API.
  if (typeof window !== "undefined") return window.location.origin;

  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
}

export function getApiError(payload: unknown, fallback: string) {
  if (typeof payload !== "object" || payload === null) return fallback;
  const body = payload as Record<string, unknown>;
  if (typeof body.errorMessage === "string" && body.errorMessage) return body.errorMessage;
  if (typeof body.message === "string" && body.message) return body.message;
  return fallback;
}

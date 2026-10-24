export function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
}

export function getApiError(payload: unknown, fallback: string) {
  if (typeof payload !== "object" || payload === null) return fallback;
  const body = payload as Record<string, unknown>;
  if (typeof body.errorMessage === "string" && body.errorMessage) return body.errorMessage;
  if (typeof body.message === "string" && body.message) return body.message;
  return fallback;
}

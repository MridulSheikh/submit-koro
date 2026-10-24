import { headers } from "next/headers";
import { apiBaseUrl } from "@/lib/api";
export { getApiError } from "@/lib/api";

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  errorMessage?: string;
  data: T;
  meta?: { page?: number; limit?: number; total?: number };
};

export async function serverApiFetch(path: string, init: RequestInit = {}) {
  const cookie = (await headers()).get("cookie");
  const requestHeaders = new Headers(init.headers);
  if (cookie) requestHeaders.set("cookie", cookie);

  return fetch(`${apiBaseUrl()}/api${path}`, {
    ...init,
    headers: requestHeaders,
    cache: "no-store",
  });
}

export async function readApiResponse<T>(response: Response) {
  return (await response.json()) as ApiEnvelope<T>;
}

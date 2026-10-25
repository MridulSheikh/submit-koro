"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

const RETRY_DELAY_MS = 2_000;
const REQUEST_TIMEOUT_MS = 5_000;

export function ApiHealthGate({ children }: { children: React.ReactNode }) {
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;

    const wait = () =>
      new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, RETRY_DELAY_MS);
      });

    const checkHealth = async () => {
      while (isActive) {
        controller = new AbortController();
        const requestTimeoutId = setTimeout(
          () => controller?.abort(),
          REQUEST_TIMEOUT_MS,
        );

        try {
          const response = await fetch(`${apiBaseUrl()}/health`, {
            cache: "no-store",
            signal: controller.signal,
          });

          if (response.ok) {
            if (isActive) setIsApiReady(true);
            return;
          }
        } catch {
          // Keep the loading screen visible and retry while the API is unavailable.
        } finally {
          clearTimeout(requestTimeoutId);
        }

        if (isActive) await wait();
      }
    };

    void checkHealth();

    return () => {
      isActive = false;
      controller?.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!isApiReady) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center"
        role="status"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
        />
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Connecting to Submit Koro</h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we connect to the server.
          </p>
        </div>
      </main>
    );
  }

  return children;
}

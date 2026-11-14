export class SnapArtApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export async function snapArtApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("X-SnapArt-Client", "web");
  if (options.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`/api/snapart${path}`, {
    ...options,
    headers,
    cache: "no-store",
    signal: options.signal ?? AbortSignal.timeout(12_000),
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    const message = response.status < 500 && typeof data?.message === "string"
      ? data.message
      : "The studio service is unavailable. Please try again.";
    throw new SnapArtApiError(response.status, message);
  }
  return data as T;
}

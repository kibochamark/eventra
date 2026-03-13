const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

/**
 * Browser-side fetch helper. Includes credentials so the session cookie
 * is automatically sent to the Eventra Service backend.
 */
export async function clientFetch(
  path: string,
  init?: RequestInit & { isFormData?: boolean }
): Promise<Response> {
  const { isFormData, ...rest } = init ?? {};

  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers,
  });
}

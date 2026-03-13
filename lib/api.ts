import { cookies } from "next/headers";

const BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

/**
 * Server-side fetch helper. Forwards the incoming session cookie so the
 * Eventra Service backend can authenticate the request.
 *
 * For multipart/form-data (file uploads) pass the FormData as body and
 * omit Content-Type — the browser boundary will be set automatically.
 */
export async function serverFetch(
  path: string,
  init?: RequestInit & { isFormData?: boolean }
): Promise<Response> {
  const jar = await cookies();
  const cookieHeader = jar.toString();

  const { isFormData, ...rest } = init ?? {};

  const headers: Record<string, string> = {
    Cookie: cookieHeader,
    ...(rest.headers as Record<string, string>),
  };

  // Only set JSON content-type when not uploading files
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  console.log(`[serverFetch] ${rest.method ?? "GET"}${BASE} ${path}`);

  return fetch(`${BASE}${path}`, {
    ...rest,
    headers,
  });
}

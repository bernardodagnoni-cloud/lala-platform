/**
 * Flatten an unknown error (thrown exception, or a Supabase/PostgREST
 * `{ message, code, details, cause }`-shaped object) into a single string
 * that's actually readable in server logs, instead of relying on how
 * `console.error` happens to serialize the object.
 */
export function describeError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);

  const e = error as { message?: unknown; code?: unknown; details?: unknown; cause?: unknown };
  const parts: string[] = [];
  if (typeof e.message === "string") parts.push(e.message);
  if (e.code) parts.push(`code=${String(e.code)}`);
  if (e.details) parts.push(`details=${String(e.details)}`);
  if (e.cause) parts.push(`cause=${describeError(e.cause)}`);

  return parts.length ? parts.join(" | ") : JSON.stringify(error);
}

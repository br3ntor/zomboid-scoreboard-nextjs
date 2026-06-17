export type Result<T> =
  | { status: "ok"; data: T }
  | { status: "error"; error: Error };

export const ok = <T>(data: T): Result<T> => ({ status: "ok", data });

export const err = (error: Error): Result<never> => ({
  status: "error",
  error,
});

export async function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Common response types
 */

/**
 * Standard response type for operations that can succeed or fail
 * @template S - Success data type
 * @template E - Error data type
 */
export type Response<S, E = string> =
  | { success: true; data: S }
  | { success: false; error: E };

/**
 * Response with optional data (for operations that may have no return value)
 */
export type VoidResponse<E = string> = Response<void, E>;

/**
 * Helper to create success response
 */
export function success<S>(data: S): Response<S, never> {
  return { success: true, data };
}

/**
 * Helper to create error response
 */
export function error<E>(error: E): Response<never, E> {
  return { success: false, error };
}

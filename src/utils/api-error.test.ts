import { describe, it, expect } from 'vitest';
import { formatApiError } from './api-error.js';

describe('formatApiError', () => {
  it('extracts message from standard Error', () => {
    const error = new Error('Something went wrong');
    expect(formatApiError(error)).toBe('Something went wrong');
  });

  it('handles HTTP 404 errors', () => {
    const error = { response: { status: 404, data: { message: 'Not found' } } };
    expect(formatApiError(error)).toContain('not found');
  });

  it('handles HTTP 401 errors with setup hint', () => {
    const error = { response: { status: 401, data: {} } };
    expect(formatApiError(error)).toContain('saic-cli setup');
  });

  it('handles HTTP 403 errors with setup hint', () => {
    const error = { response: { status: 403, data: {} } };
    expect(formatApiError(error)).toContain('saic-cli setup');
  });

  it('handles HTTP 409 conflict errors', () => {
    const error = { response: { status: 409, data: { message: 'Conflict' } } };
    expect(formatApiError(error)).toContain('Conflict');
  });

  it('handles network errors', () => {
    const error = { code: 'ECONNREFUSED' };
    expect(formatApiError(error)).toContain('Cannot reach AI Core API');
  });

  it('handles service binding errors', () => {
    const error = new Error('Could not find service credentials for aicore');
    expect(formatApiError(error)).toContain('saic-cli setup');
  });

  it('handles unknown error types', () => {
    expect(formatApiError('unexpected')).toBe('An unexpected error occurred');
    expect(formatApiError(null)).toBe('An unexpected error occurred');
    expect(formatApiError(42)).toBe('An unexpected error occurred');
  });
});

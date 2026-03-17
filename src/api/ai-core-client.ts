import { OpenApiRequestBuilder } from '@sap-ai-sdk/core';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export async function aiCoreRequest<T>(
  method: HttpMethod,
  path: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<Response<T>> {
  try {
    const builder = new OpenApiRequestBuilder(method, path, body ? { body } : undefined);
    if (headers) {
      builder.addCustomHeaders(headers);
    }
    const result = await builder.execute();
    return { success: true, data: result as T };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

import { MetaApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function getMeta(
  ...args: Parameters<typeof MetaApi.metaGet>
): Promise<Response<any>> {
  try {
    const result = await MetaApi.metaGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

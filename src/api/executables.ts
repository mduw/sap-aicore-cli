import { ExecutableApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listExecutables(
  ...args: Parameters<typeof ExecutableApi.executableQuery>
): Promise<Response<any>> {
  try {
    const result = await ExecutableApi.executableQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getExecutable(
  ...args: Parameters<typeof ExecutableApi.executableGet>
): Promise<Response<any>> {
  try {
    const result = await ExecutableApi.executableGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

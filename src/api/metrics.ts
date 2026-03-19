import { MetricsApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listMetrics(
  ...args: Parameters<typeof MetricsApi.metricsFind>
): Promise<Response<any>> {
  try {
    const result = await MetricsApi.metricsFind(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteMetrics(
  ...args: Parameters<typeof MetricsApi.metricsDelete>
): Promise<Response<any>> {
  try {
    const result = await MetricsApi.metricsDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

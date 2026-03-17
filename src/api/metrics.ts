import { MetricsApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listMetrics(
  resourceGroup: string,
  options?: { executionId?: string },
): Promise<Response<any>> {
  try {
    const queryParams: any = {};
    if (options?.executionId) {
      queryParams.executionIds = [options.executionId];
    }
    const result = await MetricsApi.metricsFind(
      queryParams,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteMetrics(
  executionId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await MetricsApi.metricsDelete(
      { executionId },
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

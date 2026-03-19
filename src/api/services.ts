import { ServiceApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listServices(
  ...args: Parameters<typeof ServiceApi.kubesubmitV4AiservicesGetAll>
): Promise<Response<any>> {
  try {
    const result = await ServiceApi.kubesubmitV4AiservicesGetAll(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getService(
  ...args: Parameters<typeof ServiceApi.kubesubmitV4AiservicesGet>
): Promise<Response<any>> {
  try {
    const result = await ServiceApi.kubesubmitV4AiservicesGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

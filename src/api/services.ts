import { ServiceApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listServices(): Promise<Response<any>> {
  try {
    const result = await ServiceApi.kubesubmitV4AiservicesGetAll().execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getService(
  name: string,
): Promise<Response<any>> {
  try {
    const result = await ServiceApi.kubesubmitV4AiservicesGet(
      name,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

import { ApplicationApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listApplications(
  ...args: Parameters<typeof ApplicationApi.kubesubmitV4ApplicationsGetAll>
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsGetAll(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getApplication(
  ...args: Parameters<typeof ApplicationApi.kubesubmitV4ApplicationsGet>
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createApplication(
  ...args: Parameters<typeof ApplicationApi.kubesubmitV4ApplicationsCreate>
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateApplication(
  ...args: Parameters<typeof ApplicationApi.kubesubmitV4ApplicationsUpdate>
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsUpdate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteApplication(
  ...args: Parameters<typeof ApplicationApi.kubesubmitV4ApplicationsDelete>
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

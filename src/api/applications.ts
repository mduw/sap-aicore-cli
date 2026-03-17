import { ApplicationApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listApplications(
  options?: { top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsGetAll(
      {
        $top: options?.top,
        $skip: options?.skip,
      },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getApplication(
  name: string,
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsGet(
      name,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createApplication(
  body: { repositoryUrl: string; revision: string; path: string; applicationName: string },
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsCreate(
      body,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateApplication(
  name: string,
  body: { repositoryUrl?: string; revision?: string; path?: string },
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsUpdate(
      name,
      body as any,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteApplication(
  name: string,
): Promise<Response<any>> {
  try {
    const result = await ApplicationApi.kubesubmitV4ApplicationsDelete(
      name,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

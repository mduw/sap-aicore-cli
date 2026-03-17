import { ResourceGroupApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listResourceGroups(
  options?: { top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsGetAll(
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

export async function getResourceGroup(
  id: string,
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsGet(
      id,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createResourceGroup(
  body: { resourceGroupId?: string; labels?: any[] },
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsCreate(
      body,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateResourceGroup(
  id: string,
  body: { labels?: any[] },
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsPatch(
      id,
      body,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteResourceGroup(
  id: string,
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsDelete(
      id,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

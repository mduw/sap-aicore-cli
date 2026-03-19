import { ResourceGroupApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listResourceGroups(
  ...args: Parameters<typeof ResourceGroupApi.kubesubmitV4ResourcegroupsGetAll>
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsGetAll(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getResourceGroup(
  ...args: Parameters<typeof ResourceGroupApi.kubesubmitV4ResourcegroupsGet>
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createResourceGroup(
  ...args: Parameters<typeof ResourceGroupApi.kubesubmitV4ResourcegroupsCreate>
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateResourceGroup(
  ...args: Parameters<typeof ResourceGroupApi.kubesubmitV4ResourcegroupsPatch>
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsPatch(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteResourceGroup(
  ...args: Parameters<typeof ResourceGroupApi.kubesubmitV4ResourcegroupsDelete>
): Promise<Response<any>> {
  try {
    const result = await ResourceGroupApi.kubesubmitV4ResourcegroupsDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

import { DeploymentApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listDeployments(
  resourceGroup: string,
  options?: { status?: string; top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentQuery(
      {
        status: options?.status as any,
        $top: options?.top,
        $skip: options?.skip,
      },
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getDeployment(
  deploymentId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentGet(
      deploymentId,
      {},
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createDeployment(
  configurationId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentCreate(
      { configurationId },
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateDeployment(
  deploymentId: string,
  targetStatus: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentModify(
      deploymentId,
      { targetStatus } as any,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteDeployment(
  deploymentId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentDelete(
      deploymentId,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

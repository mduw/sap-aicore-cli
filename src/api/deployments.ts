import { DeploymentApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listDeployments(
  ...args: Parameters<typeof DeploymentApi.deploymentQuery>
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getDeployment(
  ...args: Parameters<typeof DeploymentApi.deploymentGet>
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createDeployment(
  ...args: Parameters<typeof DeploymentApi.deploymentCreate>
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateDeployment(
  ...args: Parameters<typeof DeploymentApi.deploymentModify>
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentModify(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteDeployment(
  ...args: Parameters<typeof DeploymentApi.deploymentDelete>
): Promise<Response<any>> {
  try {
    const result = await DeploymentApi.deploymentDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

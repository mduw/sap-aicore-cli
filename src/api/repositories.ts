import { RepositoryApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listRepositories(
  ...args: Parameters<typeof RepositoryApi.kubesubmitV4RepositoriesGetAll>
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesGetAll(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getRepository(
  ...args: Parameters<typeof RepositoryApi.kubesubmitV4RepositoriesGet>
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createRepository(
  ...args: Parameters<typeof RepositoryApi.kubesubmitV4RepositoriesCreate>
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateRepository(
  ...args: Parameters<typeof RepositoryApi.kubesubmitV4RepositoriesUpdate>
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesUpdate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteRepository(
  ...args: Parameters<typeof RepositoryApi.kubesubmitV4RepositoriesDelete>
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

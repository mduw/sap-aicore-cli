import { RepositoryApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listRepositories(
  options?: { top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesGetAll(
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

export async function getRepository(
  name: string,
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesGet(
      name,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createRepository(
  body: { name: string; url: string; username: string; password: string },
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesCreate(
      body,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateRepository(
  name: string,
  body: { url?: string; username?: string; password?: string },
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesUpdate(
      name,
      body as any,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteRepository(
  name: string,
): Promise<Response<any>> {
  try {
    const result = await RepositoryApi.kubesubmitV4RepositoriesDelete(
      name,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

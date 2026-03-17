import { ObjectStoreSecretApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

function buildHeaders(resourceGroup?: string): Record<string, string> | undefined {
  if (!resourceGroup) return undefined;
  return { 'AI-Resource-Group': resourceGroup };
}

export async function listObjectStoreSecrets(
  resourceGroup?: string,
  options?: { top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsQuery(
      {
        $top: options?.top,
        $skip: options?.skip,
      },
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createObjectStoreSecret(
  body: { name: string; type: string; data: Record<string, any> },
  resourceGroup?: string,
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsCreate(
      body,
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateObjectStoreSecret(
  name: string,
  body: { name: string; type: string; data: Record<string, any> },
  resourceGroup?: string,
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsPatch(
      name,
      body,
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteObjectStoreSecret(
  name: string,
  resourceGroup?: string,
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsDelete(
      name,
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

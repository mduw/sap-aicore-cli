import { SecretApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

function buildHeaders(resourceGroup?: string): Record<string, string> | undefined {
  if (!resourceGroup) return undefined;
  return { 'AI-Resource-Group': resourceGroup };
}

export async function listGenericSecrets(
  resourceGroup?: string,
  options?: { top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsGetAll(
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

export async function getGenericSecret(
  name: string,
  resourceGroup?: string,
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsGet(
      name,
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createGenericSecret(
  body: { name: string; data: Record<string, any> },
  resourceGroup?: string,
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsCreate(
      body,
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateGenericSecret(
  name: string,
  body: { data: Record<string, any> },
  resourceGroup?: string,
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsUpdate(
      name,
      body,
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteGenericSecret(
  name: string,
  resourceGroup?: string,
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsDelete(
      name,
      buildHeaders(resourceGroup),
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

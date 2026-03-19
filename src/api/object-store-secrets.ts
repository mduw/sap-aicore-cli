import { ObjectStoreSecretApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listObjectStoreSecrets(
  ...args: Parameters<typeof ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsQuery>
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createObjectStoreSecret(
  ...args: Parameters<typeof ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsCreate>
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateObjectStoreSecret(
  ...args: Parameters<typeof ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsPatch>
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsPatch(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteObjectStoreSecret(
  ...args: Parameters<typeof ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsDelete>
): Promise<Response<any>> {
  try {
    const result = await ObjectStoreSecretApi.kubesubmitV4ObjectStoreSecretsDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

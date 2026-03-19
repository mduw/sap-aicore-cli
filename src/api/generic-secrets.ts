import { SecretApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listGenericSecrets(
  ...args: Parameters<typeof SecretApi.kubesubmitV4GenericSecretsGetAll>
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsGetAll(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getGenericSecret(
  ...args: Parameters<typeof SecretApi.kubesubmitV4GenericSecretsGet>
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createGenericSecret(
  ...args: Parameters<typeof SecretApi.kubesubmitV4GenericSecretsCreate>
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateGenericSecret(
  ...args: Parameters<typeof SecretApi.kubesubmitV4GenericSecretsUpdate>
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsUpdate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteGenericSecret(
  ...args: Parameters<typeof SecretApi.kubesubmitV4GenericSecretsDelete>
): Promise<Response<any>> {
  try {
    const result = await SecretApi.kubesubmitV4GenericSecretsDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

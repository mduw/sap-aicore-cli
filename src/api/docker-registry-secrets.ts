import { DockerRegistrySecretApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listDockerRegistrySecrets(
  ...args: Parameters<typeof DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsQuery>
): Promise<Response<any>> {
  try {
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createDockerRegistrySecret(
  ...args: Parameters<typeof DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsCreate>
): Promise<Response<any>> {
  try {
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateDockerRegistrySecret(
  ...args: Parameters<typeof DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsPatch>
): Promise<Response<any>> {
  try {
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsPatch(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteDockerRegistrySecret(
  ...args: Parameters<typeof DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsDelete>
): Promise<Response<any>> {
  try {
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

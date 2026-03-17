import { DockerRegistrySecretApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listDockerRegistrySecrets(
  options?: { top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsQuery(
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

function buildDockerConfigJson(server: string, username: string, password: string): string {
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const config = {
    auths: {
      [server]: { username, password, auth },
    },
  };
  return JSON.stringify(config);
}

export async function createDockerRegistrySecret(
  name: string,
  server: string,
  username: string,
  password: string,
): Promise<Response<any>> {
  try {
    const dockerConfigJson = buildDockerConfigJson(server, username, password);
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsCreate(
      {
        name,
        data: { '.dockerconfigjson': dockerConfigJson },
      } as any,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateDockerRegistrySecret(
  name: string,
  server: string,
  username: string,
  password: string,
): Promise<Response<any>> {
  try {
    const dockerConfigJson = buildDockerConfigJson(server, username, password);
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsPatch(
      name,
      {
        data: { '.dockerconfigjson': dockerConfigJson },
      },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteDockerRegistrySecret(
  name: string,
): Promise<Response<any>> {
  try {
    const result = await DockerRegistrySecretApi.kubesubmitV4DockerRegistrySecretsDelete(
      name,
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

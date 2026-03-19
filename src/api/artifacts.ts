import { ArtifactApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listArtifacts(
  ...args: Parameters<typeof ArtifactApi.artifactQuery>
): Promise<Response<any>> {
  try {
    const result = await ArtifactApi.artifactQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getArtifact(
  ...args: Parameters<typeof ArtifactApi.artifactGet>
): Promise<Response<any>> {
  try {
    const result = await ArtifactApi.artifactGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createArtifact(
  ...args: Parameters<typeof ArtifactApi.artifactCreate>
): Promise<Response<any>> {
  try {
    const result = await ArtifactApi.artifactCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

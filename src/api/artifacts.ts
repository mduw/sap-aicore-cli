import { ArtifactApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listArtifacts(
  resourceGroup: string,
  options?: { scenarioId?: string; kind?: string; top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await ArtifactApi.artifactQuery(
      {
        scenarioId: options?.scenarioId,
        kind: options?.kind as any,
        $top: options?.top,
        $skip: options?.skip,
      },
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getArtifact(
  artifactId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ArtifactApi.artifactGet(
      artifactId,
      {},
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createArtifact(
  name: string,
  kind: string,
  url: string,
  scenarioId: string,
  resourceGroup: string,
  options?: { description?: string; labels?: Array<{ key: string; value: string }> },
): Promise<Response<any>> {
  try {
    const body: any = { name, kind, url, scenarioId };
    if (options?.description) {
      body.description = options.description;
    }
    if (options?.labels) {
      body.labels = options.labels;
    }
    const result = await ArtifactApi.artifactCreate(
      body,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

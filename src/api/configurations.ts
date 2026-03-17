import { ConfigurationApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listConfigurations(
  resourceGroup: string,
  options?: { scenarioId?: string; top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await ConfigurationApi.configurationQuery(
      {
        scenarioId: options?.scenarioId,
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

export async function getConfiguration(
  configurationId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ConfigurationApi.configurationGet(
      configurationId,
      {},
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createConfiguration(
  name: string,
  executableId: string,
  scenarioId: string,
  resourceGroup: string,
  options?: { parameterBindings?: Array<{ key: string; value: string }>; inputArtifactBindings?: Array<{ key: string; artifactId: string }> },
): Promise<Response<any>> {
  try {
    const body: any = { name, executableId, scenarioId };
    if (options?.parameterBindings) {
      body.parameterBindings = options.parameterBindings;
    }
    if (options?.inputArtifactBindings) {
      body.inputArtifactBindings = options.inputArtifactBindings;
    }
    const result = await ConfigurationApi.configurationCreate(
      body,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

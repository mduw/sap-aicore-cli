import { ScenarioApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function getScenario(
  scenarioId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ScenarioApi.scenarioGet(
      scenarioId,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function listScenarioVersions(
  scenarioId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ScenarioApi.scenarioQueryVersions(
      scenarioId,
      {},
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function listModels(
  scenarioId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ScenarioApi.scenarioQueryModels(
      scenarioId,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

import { ScenarioApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function getScenario(
  ...args: Parameters<typeof ScenarioApi.scenarioGet>
): Promise<Response<any>> {
  try {
    const result = await ScenarioApi.scenarioGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function listScenarioVersions(
  ...args: Parameters<typeof ScenarioApi.scenarioQueryVersions>
): Promise<Response<any>> {
  try {
    const result = await ScenarioApi.scenarioQueryVersions(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function listModels(
  ...args: Parameters<typeof ScenarioApi.scenarioQueryModels>
): Promise<Response<any>> {
  try {
    const result = await ScenarioApi.scenarioQueryModels(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

import { ExecutableApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listExecutables(
  scenarioId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutableApi.executableQuery(
      scenarioId,
      {},
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getExecutable(
  scenarioId: string,
  executableId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutableApi.executableGet(
      scenarioId,
      executableId,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

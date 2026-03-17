import { ExecutionApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listExecutions(
  resourceGroup: string,
  options?: { status?: string; scenarioId?: string; top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionQuery(
      {
        status: options?.status as any,
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

export async function getExecution(
  executionId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionGet(
      executionId,
      {},
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createExecution(
  configurationId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionCreate(
      { configurationId },
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateExecution(
  executionId: string,
  targetStatus: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionModify(
      executionId,
      { targetStatus } as any,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteExecution(
  executionId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionDelete(
      executionId,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

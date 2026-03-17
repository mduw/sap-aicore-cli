import { ExecutionScheduleApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listExecutionSchedules(
  resourceGroup: string,
  options?: { top?: number; skip?: number },
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleQuery(
      {
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

export async function getExecutionSchedule(
  executionScheduleId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleGet(
      executionScheduleId,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createExecutionSchedule(
  configurationId: string,
  cron: string,
  name: string,
  resourceGroup: string,
  options?: { start?: string; end?: string },
): Promise<Response<any>> {
  try {
    const body: any = { configurationId, cron, name };
    if (options?.start) {
      body.start = options.start;
    }
    if (options?.end) {
      body.end = options.end;
    }
    const result = await ExecutionScheduleApi.executionScheduleCreate(
      body,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateExecutionSchedule(
  executionScheduleId: string,
  resourceGroup: string,
  options?: { cron?: string; status?: string },
): Promise<Response<any>> {
  try {
    const body: any = {};
    if (options?.cron) {
      body.cron = options.cron;
    }
    if (options?.status) {
      body.status = options.status;
    }
    const result = await ExecutionScheduleApi.executionScheduleModify(
      executionScheduleId,
      body,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteExecutionSchedule(
  executionScheduleId: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleDelete(
      executionScheduleId,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

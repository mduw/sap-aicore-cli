import { ExecutionScheduleApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listExecutionSchedules(
  ...args: Parameters<typeof ExecutionScheduleApi.executionScheduleQuery>
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getExecutionSchedule(
  ...args: Parameters<typeof ExecutionScheduleApi.executionScheduleGet>
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createExecutionSchedule(
  ...args: Parameters<typeof ExecutionScheduleApi.executionScheduleCreate>
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateExecutionSchedule(
  ...args: Parameters<typeof ExecutionScheduleApi.executionScheduleModify>
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleModify(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteExecutionSchedule(
  ...args: Parameters<typeof ExecutionScheduleApi.executionScheduleDelete>
): Promise<Response<any>> {
  try {
    const result = await ExecutionScheduleApi.executionScheduleDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

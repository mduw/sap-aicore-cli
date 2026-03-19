import { ExecutionApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listExecutions(
  ...args: Parameters<typeof ExecutionApi.executionQuery>
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getExecution(
  ...args: Parameters<typeof ExecutionApi.executionGet>
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createExecution(
  ...args: Parameters<typeof ExecutionApi.executionCreate>
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function updateExecution(
  ...args: Parameters<typeof ExecutionApi.executionModify>
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionModify(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteExecution(
  ...args: Parameters<typeof ExecutionApi.executionDelete>
): Promise<Response<any>> {
  try {
    const result = await ExecutionApi.executionDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

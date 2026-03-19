import { ConfigurationApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function listConfigurations(
  ...args: Parameters<typeof ConfigurationApi.configurationQuery>
): Promise<Response<any>> {
  try {
    const result = await ConfigurationApi.configurationQuery(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getConfiguration(
  ...args: Parameters<typeof ConfigurationApi.configurationGet>
): Promise<Response<any>> {
  try {
    const result = await ConfigurationApi.configurationGet(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function createConfiguration(
  ...args: Parameters<typeof ConfigurationApi.configurationCreate>
): Promise<Response<any>> {
  try {
    const result = await ConfigurationApi.configurationCreate(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

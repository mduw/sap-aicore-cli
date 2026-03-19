import { FileApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function uploadDatasetFile(
  ...args: Parameters<typeof FileApi.fileUpload>
): Promise<Response<any>> {
  try {
    const result = await FileApi.fileUpload(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getDatasetFile(
  ...args: Parameters<typeof FileApi.fileDownload>
): Promise<Response<any>> {
  try {
    const result = await FileApi.fileDownload(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteDatasetFile(
  ...args: Parameters<typeof FileApi.fileDelete>
): Promise<Response<any>> {
  try {
    const result = await FileApi.fileDelete(...args).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

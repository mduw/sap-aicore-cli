import { FileApi } from '@sap-ai-sdk/ai-api';
import type { Response } from '../types/common.js';
import { formatApiError } from '../utils/api-error.js';

export async function uploadDatasetFile(
  remotePath: string,
  fileBody: any,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await FileApi.fileUpload(
      remotePath,
      fileBody,
      {},
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function getDatasetFile(
  remotePath: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await FileApi.fileDownload(
      remotePath,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

export async function deleteDatasetFile(
  remotePath: string,
  resourceGroup: string,
): Promise<Response<any>> {
  try {
    const result = await FileApi.fileDelete(
      remotePath,
      { 'AI-Resource-Group': resourceGroup },
    ).execute();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: formatApiError(error) };
  }
}

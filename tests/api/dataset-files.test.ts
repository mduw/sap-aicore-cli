import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    FileApi: {
      fileUpload: vi.fn(() => mockBuilder),
      fileDownload: vi.fn(() => mockBuilder),
      fileDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { FileApi } from '@sap-ai-sdk/ai-api';
import {
  uploadDatasetFile,
  getDatasetFile,
  deleteDatasetFile,
} from '../../src/api/dataset-files.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('dataset-files API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadDatasetFile', () => {
    it('calls FileApi.fileUpload with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Uploaded' });

      const buffer = Buffer.from('test content');
      const result = await uploadDatasetFile(
        '/path/to/file.csv',
        buffer,
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(FileApi.fileUpload).toHaveBeenCalledWith(
        '/path/to/file.csv',
        buffer,
        {},
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Upload failed'));

      const result = await uploadDatasetFile(
        '/path/to/file.csv',
        Buffer.from('test'),
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Upload failed');
      }
    });
  });

  describe('getDatasetFile', () => {
    it('passes path correctly', async () => {
      mockExecute.mockResolvedValueOnce(Buffer.from('file content'));

      const result = await getDatasetFile(
        '/path/to/file.csv',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(FileApi.fileDownload).toHaveBeenCalledWith(
        '/path/to/file.csv',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('deleteDatasetFile', () => {
    it('passes path correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteDatasetFile(
        '/path/to/file.csv',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(FileApi.fileDelete).toHaveBeenCalledWith(
        '/path/to/file.csv',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

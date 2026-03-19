import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    MetricsApi: {
      metricsFind: vi.fn(() => mockBuilder),
      metricsDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { MetricsApi } from '@sap-ai-sdk/ai-api';
import {
  listMetrics,
  deleteMetrics,
} from '../../src/api/metrics.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('metrics API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMetrics', () => {
    it('calls MetricsApi.metricsFind with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ name: 'accuracy' }] });

      const result = await listMetrics(
        { executionIds: ['e1'] },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(MetricsApi.metricsFind).toHaveBeenCalledWith(
        { executionIds: ['e1'] },
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listMetrics(
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('deleteMetrics', () => {
    it('passes execution ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteMetrics(
        { executionId: 'e1' },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(MetricsApi.metricsDelete).toHaveBeenCalledWith(
        { executionId: 'e1' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

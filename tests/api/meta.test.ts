import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    MetaApi: {
      metaGet: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { MetaApi } from '@sap-ai-sdk/ai-api';
import { getMeta } from '../../src/api/meta.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('meta API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMeta', () => {
    it('calls MetaApi.metaGet and returns success', async () => {
      mockExecute.mockResolvedValueOnce({ capabilities: ['deployment'] });

      const result = await getMeta();

      expect(result.success).toBe(true);
      expect(MetaApi.metaGet).toHaveBeenCalled();
      if (result.success) {
        expect(result.data.capabilities).toContain('deployment');
      }
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await getMeta();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });
});

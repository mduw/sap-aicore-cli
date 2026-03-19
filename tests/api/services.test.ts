import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ServiceApi: {
      kubesubmitV4AiservicesGetAll: vi.fn(() => mockBuilder),
      kubesubmitV4AiservicesGet: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ServiceApi } from '@sap-ai-sdk/ai-api';
import {
  listServices,
  getService,
} from '../../src/api/services.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('services API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listServices', () => {
    it('calls ServiceApi.kubesubmitV4AiservicesGetAll', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ name: 'service1' }] });

      const result = await listServices();

      expect(result.success).toBe(true);
      expect(ServiceApi.kubesubmitV4AiservicesGetAll).toHaveBeenCalled();
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listServices();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getService', () => {
    it('passes service name correctly', async () => {
      mockExecute.mockResolvedValueOnce({ name: 'service1', url: 'https://service.example.com' });

      const result = await getService('service1');

      expect(result.success).toBe(true);
      expect(ServiceApi.kubesubmitV4AiservicesGet).toHaveBeenCalledWith('service1');
    });
  });
});

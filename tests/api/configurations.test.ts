import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ConfigurationApi: {
      configurationQuery: vi.fn(() => mockBuilder),
      configurationGet: vi.fn(() => mockBuilder),
      configurationCreate: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ConfigurationApi } from '@sap-ai-sdk/ai-api';
import {
  listConfigurations,
  getConfiguration,
  createConfiguration,
} from '../../src/api/configurations.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('configurations API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listConfigurations', () => {
    it('calls ConfigurationApi.configurationQuery with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ count: 1, resources: [{ id: 'c1' }] });

      const result = await listConfigurations(
        { scenarioId: 'scenario-1', $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ConfigurationApi.configurationQuery).toHaveBeenCalledWith(
        { scenarioId: 'scenario-1', $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listConfigurations(
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getConfiguration', () => {
    it('passes configuration ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'c1', name: 'test-config' });

      const result = await getConfiguration(
        'c1',
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ConfigurationApi.configurationGet).toHaveBeenCalledWith(
        'c1',
        {},
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('createConfiguration', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'c-new' });

      const result = await createConfiguration(
        { name: 'my-config', executableId: 'exec-1', scenarioId: 'scenario-1' },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ConfigurationApi.configurationCreate).toHaveBeenCalledWith(
        { name: 'my-config', executableId: 'exec-1', scenarioId: 'scenario-1' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

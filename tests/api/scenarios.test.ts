import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ScenarioApi: {
      scenarioGet: vi.fn(() => mockBuilder),
      scenarioQueryVersions: vi.fn(() => mockBuilder),
      scenarioQueryModels: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ScenarioApi } from '@sap-ai-sdk/ai-api';
import {
  getScenario,
  listScenarioVersions,
  listModels,
} from '../../src/api/scenarios.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('scenarios API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getScenario', () => {
    it('calls ScenarioApi.scenarioGet with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ id: 's1', name: 'test-scenario' });

      const result = await getScenario(
        's1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ScenarioApi.scenarioGet).toHaveBeenCalledWith(
        's1',
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Not found'));

      const result = await getScenario(
        's1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Not found');
      }
    });
  });

  describe('listScenarioVersions', () => {
    it('passes scenario ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ id: 'v1' }] });

      const result = await listScenarioVersions(
        's1',
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ScenarioApi.scenarioQueryVersions).toHaveBeenCalledWith(
        's1',
        {},
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('listModels', () => {
    it('passes scenario ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ name: 'gpt-4' }] });

      const result = await listModels(
        's1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ScenarioApi.scenarioQueryModels).toHaveBeenCalledWith(
        's1',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

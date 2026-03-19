import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ArtifactApi: {
      artifactQuery: vi.fn(() => mockBuilder),
      artifactGet: vi.fn(() => mockBuilder),
      artifactCreate: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ArtifactApi } from '@sap-ai-sdk/ai-api';
import {
  listArtifacts,
  getArtifact,
  createArtifact,
} from '../../src/api/artifacts.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('artifacts API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listArtifacts', () => {
    it('calls ArtifactApi.artifactQuery with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ id: 'a1' }] });

      const result = await listArtifacts(
        { scenarioId: 'scenario-1', $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ArtifactApi.artifactQuery).toHaveBeenCalledWith(
        { scenarioId: 'scenario-1', $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listArtifacts(
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getArtifact', () => {
    it('passes artifact ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'a1', name: 'test-artifact' });

      const result = await getArtifact(
        'a1',
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ArtifactApi.artifactGet).toHaveBeenCalledWith(
        'a1',
        {},
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('createArtifact', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'a-new' });

      const result = await createArtifact(
        { name: 'my-artifact', kind: 'model' as any, url: 'ai://default/path', scenarioId: 'scenario-1' },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ArtifactApi.artifactCreate).toHaveBeenCalledWith(
        { name: 'my-artifact', kind: 'model', url: 'ai://default/path', scenarioId: 'scenario-1' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

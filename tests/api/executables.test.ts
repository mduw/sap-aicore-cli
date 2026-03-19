import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ExecutableApi: {
      executableQuery: vi.fn(() => mockBuilder),
      executableGet: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ExecutableApi } from '@sap-ai-sdk/ai-api';
import {
  listExecutables,
  getExecutable,
} from '../../src/api/executables.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('executables API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listExecutables', () => {
    it('calls ExecutableApi.executableQuery with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ id: 'ex1' }] });

      const result = await listExecutables(
        'scenario-1',
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutableApi.executableQuery).toHaveBeenCalledWith(
        'scenario-1',
        {},
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listExecutables(
        'scenario-1',
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getExecutable', () => {
    it('passes scenario ID and executable ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'ex1', name: 'test-exec' });

      const result = await getExecutable(
        'scenario-1',
        'ex1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutableApi.executableGet).toHaveBeenCalledWith(
        'scenario-1',
        'ex1',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

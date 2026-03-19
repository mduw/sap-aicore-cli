import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    RepositoryApi: {
      kubesubmitV4RepositoriesGetAll: vi.fn(() => mockBuilder),
      kubesubmitV4RepositoriesGet: vi.fn(() => mockBuilder),
      kubesubmitV4RepositoriesCreate: vi.fn(() => mockBuilder),
      kubesubmitV4RepositoriesUpdate: vi.fn(() => mockBuilder),
      kubesubmitV4RepositoriesDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { RepositoryApi } from '@sap-ai-sdk/ai-api';
import {
  listRepositories,
  getRepository,
  createRepository,
  updateRepository,
  deleteRepository,
} from '../../src/api/repositories.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('repositories API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRepositories', () => {
    it('calls RepositoryApi.kubesubmitV4RepositoriesGetAll with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ name: 'repo1' }] });

      const result = await listRepositories(
        { $top: 10 },
      );

      expect(result.success).toBe(true);
      expect(RepositoryApi.kubesubmitV4RepositoriesGetAll).toHaveBeenCalledWith(
        { $top: 10 },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listRepositories({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getRepository', () => {
    it('passes repository name correctly', async () => {
      mockExecute.mockResolvedValueOnce({ name: 'repo1', url: 'https://github.com/test' });

      const result = await getRepository('repo1');

      expect(result.success).toBe(true);
      expect(RepositoryApi.kubesubmitV4RepositoriesGet).toHaveBeenCalledWith('repo1');
    });
  });

  describe('createRepository', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Created' });

      const result = await createRepository({
        name: 'repo1',
        url: 'https://github.com/test',
        username: 'user',
        password: 'pass',
      });

      expect(result.success).toBe(true);
      expect(RepositoryApi.kubesubmitV4RepositoriesCreate).toHaveBeenCalledWith({
        name: 'repo1',
        url: 'https://github.com/test',
        username: 'user',
        password: 'pass',
      });
    });
  });

  describe('updateRepository', () => {
    it('passes name and body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Updated' });

      const result = await updateRepository('repo1', { url: 'https://new-url.com' } as any);

      expect(result.success).toBe(true);
      expect(RepositoryApi.kubesubmitV4RepositoriesUpdate).toHaveBeenCalledWith(
        'repo1',
        { url: 'https://new-url.com' },
      );
    });
  });

  describe('deleteRepository', () => {
    it('passes repository name', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteRepository('repo1');

      expect(result.success).toBe(true);
      expect(RepositoryApi.kubesubmitV4RepositoriesDelete).toHaveBeenCalledWith('repo1');
    });
  });
});

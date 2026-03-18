import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ApplicationApi: {
      kubesubmitV4ApplicationsGetAll: vi.fn(() => mockBuilder),
      kubesubmitV4ApplicationsGet: vi.fn(() => mockBuilder),
      kubesubmitV4ApplicationsCreate: vi.fn(() => mockBuilder),
      kubesubmitV4ApplicationsUpdate: vi.fn(() => mockBuilder),
      kubesubmitV4ApplicationsDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ApplicationApi } from '@sap-ai-sdk/ai-api';
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../../src/api/applications.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('applications API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listApplications', () => {
    it('calls ApplicationApi.kubesubmitV4ApplicationsGetAll with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ applicationName: 'app1' }] });

      const result = await listApplications({ $top: 10 });

      expect(result.success).toBe(true);
      expect(ApplicationApi.kubesubmitV4ApplicationsGetAll).toHaveBeenCalledWith({ $top: 10 });
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listApplications({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getApplication', () => {
    it('passes application name correctly', async () => {
      mockExecute.mockResolvedValueOnce({ applicationName: 'app1' });

      const result = await getApplication('app1');

      expect(result.success).toBe(true);
      expect(ApplicationApi.kubesubmitV4ApplicationsGet).toHaveBeenCalledWith('app1');
    });
  });

  describe('createApplication', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Created' });

      const result = await createApplication({
        applicationName: 'app1',
        repositoryUrl: 'https://github.com/test',
        revision: 'main',
        path: 'workflows',
      });

      expect(result.success).toBe(true);
      expect(ApplicationApi.kubesubmitV4ApplicationsCreate).toHaveBeenCalledWith({
        applicationName: 'app1',
        repositoryUrl: 'https://github.com/test',
        revision: 'main',
        path: 'workflows',
      });
    });
  });

  describe('updateApplication', () => {
    it('passes name and body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Updated' });

      const result = await updateApplication('app1', { revision: 'develop' } as any);

      expect(result.success).toBe(true);
      expect(ApplicationApi.kubesubmitV4ApplicationsUpdate).toHaveBeenCalledWith(
        'app1',
        { revision: 'develop' },
      );
    });
  });

  describe('deleteApplication', () => {
    it('passes application name', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteApplication('app1');

      expect(result.success).toBe(true);
      expect(ApplicationApi.kubesubmitV4ApplicationsDelete).toHaveBeenCalledWith('app1');
    });
  });
});

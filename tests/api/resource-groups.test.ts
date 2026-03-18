import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ResourceGroupApi: {
      kubesubmitV4ResourcegroupsGetAll: vi.fn(() => mockBuilder),
      kubesubmitV4ResourcegroupsGet: vi.fn(() => mockBuilder),
      kubesubmitV4ResourcegroupsCreate: vi.fn(() => mockBuilder),
      kubesubmitV4ResourcegroupsPatch: vi.fn(() => mockBuilder),
      kubesubmitV4ResourcegroupsDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ResourceGroupApi } from '@sap-ai-sdk/ai-api';
import {
  listResourceGroups,
  getResourceGroup,
  createResourceGroup,
  updateResourceGroup,
  deleteResourceGroup,
} from '../../src/api/resource-groups.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('resource-groups API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listResourceGroups', () => {
    it('calls ResourceGroupApi.kubesubmitV4ResourcegroupsGetAll', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ resourceGroupId: 'rg1' }] });

      const result = await listResourceGroups({ $top: 10 });

      expect(result.success).toBe(true);
      expect(ResourceGroupApi.kubesubmitV4ResourcegroupsGetAll).toHaveBeenCalledWith({ $top: 10 });
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listResourceGroups({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getResourceGroup', () => {
    it('passes resource group ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ resourceGroupId: 'rg1' });

      const result = await getResourceGroup('rg1');

      expect(result.success).toBe(true);
      expect(ResourceGroupApi.kubesubmitV4ResourcegroupsGet).toHaveBeenCalledWith('rg1');
    });
  });

  describe('createResourceGroup', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ resourceGroupId: 'rg-new' });

      const result = await createResourceGroup({
        resourceGroupId: 'rg-new',
      } as any);

      expect(result.success).toBe(true);
      expect(ResourceGroupApi.kubesubmitV4ResourcegroupsCreate).toHaveBeenCalledWith({
        resourceGroupId: 'rg-new',
      });
    });
  });

  describe('updateResourceGroup', () => {
    it('passes ID and body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Updated' });

      const result = await updateResourceGroup(
        'rg1',
        { labels: [{ key: 'env', value: 'prod' }] } as any,
      );

      expect(result.success).toBe(true);
      expect(ResourceGroupApi.kubesubmitV4ResourcegroupsPatch).toHaveBeenCalledWith(
        'rg1',
        { labels: [{ key: 'env', value: 'prod' }] },
      );
    });
  });

  describe('deleteResourceGroup', () => {
    it('passes resource group ID', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteResourceGroup('rg1');

      expect(result.success).toBe(true);
      expect(ResourceGroupApi.kubesubmitV4ResourcegroupsDelete).toHaveBeenCalledWith('rg1');
    });
  });
});

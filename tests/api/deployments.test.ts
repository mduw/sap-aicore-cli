import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the SDK before importing the module under test
vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    DeploymentApi: {
      deploymentQuery: vi.fn(() => mockBuilder),
      deploymentGet: vi.fn(() => mockBuilder),
      deploymentCreate: vi.fn(() => mockBuilder),
      deploymentModify: vi.fn(() => mockBuilder),
      deploymentDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { DeploymentApi } from '@sap-ai-sdk/ai-api';
import {
  listDeployments,
  getDeployment,
  createDeployment,
  updateDeployment,
  deleteDeployment,
} from '../../src/api/deployments.js';

// Access the shared mock execute function
const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('deployments API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listDeployments', () => {
    it('calls DeploymentApi.deploymentQuery with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ count: 1, resources: [{ id: 'd1' }] });

      const result = await listDeployments(
        { status: 'RUNNING' as any, $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(DeploymentApi.deploymentQuery).toHaveBeenCalledWith(
        { status: 'RUNNING', $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listDeployments(
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getDeployment', () => {
    it('passes deployment ID and resource group correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'd1', status: 'RUNNING' });

      const result = await getDeployment(
        'd1',
        {},
        { 'AI-Resource-Group': 'my-group' },
      );

      expect(result.success).toBe(true);
      expect(DeploymentApi.deploymentGet).toHaveBeenCalledWith(
        'd1',
        {},
        { 'AI-Resource-Group': 'my-group' },
      );
    });
  });

  describe('createDeployment', () => {
    it('passes configurationId in request body', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'd-new', status: 'PENDING' });

      const result = await createDeployment(
        { configurationId: 'config-123' },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(DeploymentApi.deploymentCreate).toHaveBeenCalledWith(
        { configurationId: 'config-123' },
        { 'AI-Resource-Group': 'default' },
      );
      if (result.success) {
        expect(result.data.id).toBe('d-new');
      }
    });
  });

  describe('updateDeployment', () => {
    it('passes targetStatus in request body', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'OK' });

      const result = await updateDeployment(
        'd1',
        { targetStatus: 'STOPPED' } as any,
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(DeploymentApi.deploymentModify).toHaveBeenCalledWith(
        'd1',
        { targetStatus: 'STOPPED' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('deleteDeployment', () => {
    it('passes deployment ID and resource group', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteDeployment(
        'd1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(DeploymentApi.deploymentDelete).toHaveBeenCalledWith(
        'd1',
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns formatted error on 409 conflict', async () => {
      mockExecute.mockRejectedValueOnce({
        response: { status: 409, data: { message: 'Deployment must be stopped first' } },
      });

      const result = await deleteDeployment(
        'd1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Deployment must be stopped first');
      }
    });
  });
});

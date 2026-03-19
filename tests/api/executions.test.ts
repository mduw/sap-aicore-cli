import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ExecutionApi: {
      executionQuery: vi.fn(() => mockBuilder),
      executionGet: vi.fn(() => mockBuilder),
      executionCreate: vi.fn(() => mockBuilder),
      executionModify: vi.fn(() => mockBuilder),
      executionDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ExecutionApi } from '@sap-ai-sdk/ai-api';
import {
  listExecutions,
  getExecution,
  createExecution,
  updateExecution,
  deleteExecution,
} from '../../src/api/executions.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('executions API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listExecutions', () => {
    it('calls ExecutionApi.executionQuery with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ count: 1, resources: [{ id: 'e1' }] });

      const result = await listExecutions(
        { status: 'RUNNING' as any, $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionApi.executionQuery).toHaveBeenCalledWith(
        { status: 'RUNNING', $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listExecutions(
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getExecution', () => {
    it('passes execution ID and resource group correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'e1', status: 'COMPLETED' });

      const result = await getExecution(
        'e1',
        {},
        { 'AI-Resource-Group': 'my-group' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionApi.executionGet).toHaveBeenCalledWith(
        'e1',
        {},
        { 'AI-Resource-Group': 'my-group' },
      );
    });
  });

  describe('createExecution', () => {
    it('passes configurationId in request body', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'e-new', status: 'PENDING' });

      const result = await createExecution(
        { configurationId: 'config-123' },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionApi.executionCreate).toHaveBeenCalledWith(
        { configurationId: 'config-123' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('updateExecution', () => {
    it('passes targetStatus in request body', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'OK' });

      const result = await updateExecution(
        'e1',
        { targetStatus: 'STOPPED' } as any,
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionApi.executionModify).toHaveBeenCalledWith(
        'e1',
        { targetStatus: 'STOPPED' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('deleteExecution', () => {
    it('passes execution ID and resource group', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteExecution(
        'e1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionApi.executionDelete).toHaveBeenCalledWith(
        'e1',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

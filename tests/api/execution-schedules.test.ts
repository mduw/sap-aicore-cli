import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@sap-ai-sdk/ai-api', () => {
  const mockExecute = vi.fn();
  const mockBuilder = { execute: mockExecute };
  return {
    ExecutionScheduleApi: {
      executionScheduleQuery: vi.fn(() => mockBuilder),
      executionScheduleGet: vi.fn(() => mockBuilder),
      executionScheduleCreate: vi.fn(() => mockBuilder),
      executionScheduleModify: vi.fn(() => mockBuilder),
      executionScheduleDelete: vi.fn(() => mockBuilder),
    },
    __mockExecute: mockExecute,
  };
});

import { ExecutionScheduleApi } from '@sap-ai-sdk/ai-api';
import {
  listExecutionSchedules,
  getExecutionSchedule,
  createExecutionSchedule,
  updateExecutionSchedule,
  deleteExecutionSchedule,
} from '../../src/api/execution-schedules.js';

const mockExecute = (await import('@sap-ai-sdk/ai-api') as any).__mockExecute;

describe('execution-schedules API wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listExecutionSchedules', () => {
    it('calls ExecutionScheduleApi.executionScheduleQuery with correct params', async () => {
      mockExecute.mockResolvedValueOnce({ resources: [{ id: 'es1' }] });

      const result = await listExecutionSchedules(
        { $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionScheduleApi.executionScheduleQuery).toHaveBeenCalledWith(
        { $top: 10 },
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('returns error response on SDK failure', async () => {
      mockExecute.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await listExecutionSchedules(
        {},
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Connection failed');
      }
    });
  });

  describe('getExecutionSchedule', () => {
    it('passes schedule ID correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'es1', cron: '0 * * * *' });

      const result = await getExecutionSchedule(
        'es1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionScheduleApi.executionScheduleGet).toHaveBeenCalledWith(
        'es1',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('createExecutionSchedule', () => {
    it('passes body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ id: 'es-new' });

      const result = await createExecutionSchedule(
        { configurationId: 'config-1', cron: '0 * * * *', name: 'my-schedule' },
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionScheduleApi.executionScheduleCreate).toHaveBeenCalledWith(
        { configurationId: 'config-1', cron: '0 * * * *', name: 'my-schedule' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('updateExecutionSchedule', () => {
    it('passes schedule ID and body correctly', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'OK' });

      const result = await updateExecutionSchedule(
        'es1',
        { cron: '*/5 * * * *' } as any,
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionScheduleApi.executionScheduleModify).toHaveBeenCalledWith(
        'es1',
        { cron: '*/5 * * * *' },
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('deleteExecutionSchedule', () => {
    it('passes schedule ID and resource group', async () => {
      mockExecute.mockResolvedValueOnce({ message: 'Deleted' });

      const result = await deleteExecutionSchedule(
        'es1',
        { 'AI-Resource-Group': 'default' },
      );

      expect(result.success).toBe(true);
      expect(ExecutionScheduleApi.executionScheduleDelete).toHaveBeenCalledWith(
        'es1',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

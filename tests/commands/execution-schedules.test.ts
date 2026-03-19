import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/execution-schedules.js', () => ({
  listExecutionSchedules: vi.fn(),
  getExecutionSchedule: vi.fn(),
  createExecutionSchedule: vi.fn(),
  updateExecutionSchedule: vi.fn(),
  deleteExecutionSchedule: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listExecutionSchedules,
  getExecutionSchedule,
  createExecutionSchedule,
  updateExecutionSchedule,
  deleteExecutionSchedule,
} from '../../src/api/execution-schedules.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/execution-schedules.js';

const mockListExecutionSchedules = vi.mocked(listExecutionSchedules);
const mockCreateExecutionSchedule = vi.mocked(createExecutionSchedule);
const mockUpdateExecutionSchedule = vi.mocked(updateExecutionSchedule);
const mockDeleteExecutionSchedule = vi.mocked(deleteExecutionSchedule);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('execution-schedule commands', () => {
  let logOutput: string[];
  let errorOutput: string[];
  let warnOutput: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    logOutput = [];
    errorOutput = [];
    warnOutput = [];
    vi.spyOn(logger, 'info').mockImplementation((msg: string) => { logOutput.push(msg); });
    vi.spyOn(logger, 'error').mockImplementation((msg: string) => { errorOutput.push(msg); });
    vi.spyOn(logger, 'success').mockImplementation((msg: string) => { logOutput.push(msg); });
    vi.spyOn(logger, 'warn').mockImplementation((msg: string) => { warnOutput.push(msg); });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('list-execution-schedules', () => {
    const cmd = findCommand('list-execution-schedules');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ id: 'es1', cron: '0 * * * *' }] };
      mockListExecutionSchedules.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 'es1', cron: '0 * * * *' }], expect.any(Array));
    });

    it('logs error on API failure', async () => {
      mockListExecutionSchedules.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-execution-schedule', () => {
    const cmd = findCommand('create-execution-schedule');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        body: '{"configurationId":"cfg-1","cron":"0 * * * *","name":"my-schedule"}',
        resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-schedule'))).toBe(true);
      expect(mockCreateExecutionSchedule).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateExecutionSchedule.mockResolvedValueOnce({
        success: true,
        data: { id: 'es-new' },
      });

      await cmd.run({
        body: '{"configurationId":"cfg-1","cron":"0 * * * *","name":"my-schedule"}',
        resourceGroup: 'default', dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateExecutionSchedule).toHaveBeenCalled();
      expect(logOutput.some(l => l.includes('es-new'))).toBe(true);
    });
  });

  describe('update-execution-schedule', () => {
    const cmd = findCommand('update-execution-schedule');

    it('shows dry-run message', async () => {
      await cmd.run({ id: 'es1', body: '{"status":"ACTIVE"}', resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('es1'))).toBe(true);
      expect(mockUpdateExecutionSchedule).not.toHaveBeenCalled();
    });
  });

  describe('delete-execution-schedule', () => {
    const cmd = findCommand('delete-execution-schedule');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ id: 'es1', resourceGroup: 'default', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('es1'))).toBe(true);
      expect(mockDeleteExecutionSchedule).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ id: 'es1', resourceGroup: 'default', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteExecutionSchedule).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteExecutionSchedule.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ id: 'es1', resourceGroup: 'default', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteExecutionSchedule).toHaveBeenCalledWith(
        'es1',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

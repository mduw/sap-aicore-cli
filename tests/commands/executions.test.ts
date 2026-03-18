import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/executions.js', () => ({
  listExecutions: vi.fn(),
  getExecution: vi.fn(),
  createExecution: vi.fn(),
  updateExecution: vi.fn(),
  deleteExecution: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listExecutions,
  getExecution,
  createExecution,
  updateExecution,
  deleteExecution,
} from '../../src/api/executions.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/executions.js';

const mockListExecutions = vi.mocked(listExecutions);
const mockCreateExecution = vi.mocked(createExecution);
const mockUpdateExecution = vi.mocked(updateExecution);
const mockDeleteExecution = vi.mocked(deleteExecution);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('execution commands', () => {
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

  describe('list-executions', () => {
    const cmd = findCommand('list-executions');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ id: 'e1', status: 'COMPLETED' }] };
      mockListExecutions.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 'e1', status: 'COMPLETED' }], expect.any(Array));
    });

    it('outputs JSON when --json flag is set', async () => {
      const mockData = { resources: [{ id: 'e1' }] };
      mockListExecutions.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: true, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('"id"'))).toBe(true);
      expect(mockFormatTable).not.toHaveBeenCalled();
    });

    it('logs error on API failure', async () => {
      mockListExecutions.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-execution', () => {
    const cmd = findCommand('create-execution');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ body: '{"configurationId":"cfg-1"}', resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('cfg-1'))).toBe(true);
      expect(mockCreateExecution).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateExecution.mockResolvedValueOnce({
        success: true,
        data: { id: 'e-new', status: 'PENDING' },
      });

      await cmd.run({ body: '{"configurationId":"cfg-1"}', resourceGroup: 'default', dryRun: false, json: false, _: [], $0: '' } as any);

      expect(mockCreateExecution).toHaveBeenCalled();
      expect(logOutput.some(l => l.includes('e-new'))).toBe(true);
    });
  });

  describe('delete-execution', () => {
    const cmd = findCommand('delete-execution');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ id: 'e1', resourceGroup: 'default', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('e1'))).toBe(true);
      expect(mockDeleteExecution).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ id: 'e1', resourceGroup: 'default', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteExecution).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteExecution.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ id: 'e1', resourceGroup: 'default', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteExecution).toHaveBeenCalledWith(
        'e1',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });

  describe('update-execution', () => {
    const cmd = findCommand('update-execution');

    it('shows dry-run message', async () => {
      await cmd.run({ id: 'e1', body: '{"targetStatus":"STOPPED"}', resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('STOPPED'))).toBe(true);
      expect(mockUpdateExecution).not.toHaveBeenCalled();
    });
  });
});

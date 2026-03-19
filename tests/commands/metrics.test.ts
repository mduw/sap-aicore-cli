import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/metrics.js', () => ({
  listMetrics: vi.fn(),
  deleteMetrics: vi.fn(),
}));

import {
  listMetrics,
  deleteMetrics,
} from '../../src/api/metrics.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/metrics.js';

const mockListMetrics = vi.mocked(listMetrics);
const mockDeleteMetrics = vi.mocked(deleteMetrics);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('metrics commands', () => {
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

  describe('list-metrics', () => {
    const cmd = findCommand('list-metrics');

    it('outputs metrics data on success', async () => {
      const mockData = { resources: [{ name: 'accuracy', value: 0.95 }] };
      mockListMetrics.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('accuracy'))).toBe(true);
    });

    it('logs error on API failure', async () => {
      mockListMetrics.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('delete-metrics', () => {
    const cmd = findCommand('delete-metrics');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ query: '{"executionId":"e1"}', resourceGroup: 'default', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('e1'))).toBe(true);
      expect(mockDeleteMetrics).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ query: '{"executionId":"e1"}', resourceGroup: 'default', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteMetrics).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteMetrics.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ query: '{"executionId":"e1"}', resourceGroup: 'default', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteMetrics).toHaveBeenCalledWith(
        { executionId: 'e1' },
        { 'AI-Resource-Group': 'default' },
      );
    });

    it('shows error when executionId is missing from query', async () => {
      await cmd.run({ query: '{}', resourceGroup: 'default', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(errorOutput.some(l => l.includes('executionId'))).toBe(true);
      expect(mockDeleteMetrics).not.toHaveBeenCalled();
    });
  });
});

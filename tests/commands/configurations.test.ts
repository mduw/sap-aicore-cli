import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/configurations.js', () => ({
  listConfigurations: vi.fn(),
  getConfiguration: vi.fn(),
  createConfiguration: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listConfigurations,
  getConfiguration,
  createConfiguration,
} from '../../src/api/configurations.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/configurations.js';

const mockListConfigurations = vi.mocked(listConfigurations);
const mockCreateConfiguration = vi.mocked(createConfiguration);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('configuration commands', () => {
  let logOutput: string[];
  let errorOutput: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    logOutput = [];
    errorOutput = [];
    vi.spyOn(logger, 'info').mockImplementation((msg: string) => { logOutput.push(msg); });
    vi.spyOn(logger, 'error').mockImplementation((msg: string) => { errorOutput.push(msg); });
    vi.spyOn(logger, 'success').mockImplementation((msg: string) => { logOutput.push(msg); });
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('list-configurations', () => {
    const cmd = findCommand('list-configurations');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ id: 'c1', name: 'test' }] };
      mockListConfigurations.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 'c1', name: 'test' }], expect.any(Array));
    });

    it('outputs JSON when --json flag is set', async () => {
      const mockData = { resources: [{ id: 'c1' }] };
      mockListConfigurations.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: true, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('"id"'))).toBe(true);
      expect(mockFormatTable).not.toHaveBeenCalled();
    });

    it('logs error on API failure', async () => {
      mockListConfigurations.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-configuration', () => {
    const cmd = findCommand('create-configuration');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        name: 'my-config', executableId: 'exec-1', scenarioId: 'scenario-1',
        resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-config'))).toBe(true);
      expect(mockCreateConfiguration).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateConfiguration.mockResolvedValueOnce({
        success: true,
        data: { id: 'c-new' },
      });

      await cmd.run({
        name: 'my-config', executableId: 'exec-1', scenarioId: 'scenario-1',
        resourceGroup: 'default', dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateConfiguration).toHaveBeenCalled();
      expect(logOutput.some(l => l.includes('c-new'))).toBe(true);
    });
  });
});

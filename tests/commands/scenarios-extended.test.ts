import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/scenarios.js', () => ({
  getScenario: vi.fn(),
  listScenarioVersions: vi.fn(),
  listModels: vi.fn(),
}));

vi.mock('../../src/api/executables.js', () => ({
  listExecutables: vi.fn(),
  getExecutable: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import { getScenario, listScenarioVersions, listModels } from '../../src/api/scenarios.js';
import { listExecutables, getExecutable } from '../../src/api/executables.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/scenarios-extended.js';

const mockGetScenario = vi.mocked(getScenario);
const mockListScenarioVersions = vi.mocked(listScenarioVersions);
const mockListExecutables = vi.mocked(listExecutables);
const mockListModels = vi.mocked(listModels);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('scenarios-extended commands', () => {
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

  describe('get-scenario', () => {
    const cmd = findCommand('get-scenario');

    it('calls formatTable on success', async () => {
      mockGetScenario.mockResolvedValueOnce({ success: true, data: { id: 's1', name: 'test' } });

      await cmd.run({ id: 's1', resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 's1', name: 'test' }], expect.any(Array));
    });

    it('logs error on failure', async () => {
      mockGetScenario.mockResolvedValueOnce({ success: false, error: 'Not found' });

      await cmd.run({ id: 's1', resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Not found');
    });
  });

  describe('list-scenario-versions', () => {
    const cmd = findCommand('list-scenario-versions');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ id: 'v1' }] };
      mockListScenarioVersions.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ scenarioId: 's1', resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 'v1' }], expect.any(Array));
    });
  });

  describe('list-executables', () => {
    const cmd = findCommand('list-executables');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ id: 'ex1' }] };
      mockListExecutables.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ scenarioId: 's1', resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 'ex1' }], expect.any(Array));
    });
  });

  describe('list-models', () => {
    const cmd = findCommand('list-models');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ name: 'gpt-4' }] };
      mockListModels.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ scenarioId: 's1', resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ name: 'gpt-4' }], expect.any(Array));
    });

    it('outputs JSON when --json flag is set', async () => {
      const mockData = { resources: [{ name: 'gpt-4' }] };
      mockListModels.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ scenarioId: 's1', resourceGroup: 'default', json: true, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('gpt-4'))).toBe(true);
      expect(mockFormatTable).not.toHaveBeenCalled();
    });
  });
});

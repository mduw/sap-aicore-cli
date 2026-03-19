import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/artifacts.js', () => ({
  listArtifacts: vi.fn(),
  getArtifact: vi.fn(),
  createArtifact: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listArtifacts,
  getArtifact,
  createArtifact,
} from '../../src/api/artifacts.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/artifacts.js';

const mockListArtifacts = vi.mocked(listArtifacts);
const mockCreateArtifact = vi.mocked(createArtifact);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('artifact commands', () => {
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

  describe('list-artifacts', () => {
    const cmd = findCommand('list-artifacts');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ id: 'a1', name: 'artifact-1' }] };
      mockListArtifacts.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 'a1', name: 'artifact-1' }], expect.any(Array));
    });

    it('outputs JSON when --json flag is set', async () => {
      const mockData = { resources: [{ id: 'a1' }] };
      mockListArtifacts.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: true, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('"id"'))).toBe(true);
      expect(mockFormatTable).not.toHaveBeenCalled();
    });

    it('logs error on API failure', async () => {
      mockListArtifacts.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-artifact', () => {
    const cmd = findCommand('create-artifact');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        body: '{"name":"my-artifact","kind":"model","url":"ai://default/path","scenarioId":"scenario-1"}',
        resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-artifact'))).toBe(true);
      expect(mockCreateArtifact).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateArtifact.mockResolvedValueOnce({
        success: true,
        data: { id: 'a-new' },
      });

      await cmd.run({
        body: '{"name":"my-artifact","kind":"model","url":"ai://default/path","scenarioId":"scenario-1"}',
        resourceGroup: 'default', dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateArtifact).toHaveBeenCalled();
      expect(logOutput.some(l => l.includes('a-new'))).toBe(true);
    });
  });
});

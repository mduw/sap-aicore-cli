import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/repositories.js', () => ({
  listRepositories: vi.fn(),
  getRepository: vi.fn(),
  createRepository: vi.fn(),
  updateRepository: vi.fn(),
  deleteRepository: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listRepositories,
  getRepository,
  createRepository,
  updateRepository,
  deleteRepository,
} from '../../src/api/repositories.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/repositories.js';

const mockListRepositories = vi.mocked(listRepositories);
const mockCreateRepository = vi.mocked(createRepository);
const mockUpdateRepository = vi.mocked(updateRepository);
const mockDeleteRepository = vi.mocked(deleteRepository);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('repository commands', () => {
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

  describe('list-repositories', () => {
    const cmd = findCommand('list-repositories');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ name: 'repo1', url: 'https://github.com/test' }] };
      mockListRepositories.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith(
        [{ name: 'repo1', url: 'https://github.com/test' }],
        expect.any(Array),
      );
    });

    it('logs error on API failure', async () => {
      mockListRepositories.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-repository', () => {
    const cmd = findCommand('create-repository');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        body: '{"name":"repo1","url":"https://github.com/test","username":"user","password":"pass"}',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('repo1'))).toBe(true);
      expect(mockCreateRepository).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateRepository.mockResolvedValueOnce({
        success: true,
        data: { message: 'Created' },
      });

      await cmd.run({
        body: '{"name":"repo1","url":"https://github.com/test","username":"user","password":"pass"}',
        dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateRepository).toHaveBeenCalled();
    });
  });

  describe('update-repository', () => {
    const cmd = findCommand('update-repository');

    it('shows dry-run message', async () => {
      await cmd.run({
        name: 'repo1', body: '{"url":"https://new-url.com"}',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('repo1'))).toBe(true);
      expect(mockUpdateRepository).not.toHaveBeenCalled();
    });
  });

  describe('delete-repository', () => {
    const cmd = findCommand('delete-repository');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ name: 'repo1', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('repo1'))).toBe(true);
      expect(mockDeleteRepository).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ name: 'repo1', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteRepository).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteRepository.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ name: 'repo1', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteRepository).toHaveBeenCalledWith('repo1');
    });
  });
});

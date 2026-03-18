import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/applications.js', () => ({
  listApplications: vi.fn(),
  getApplication: vi.fn(),
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../../src/api/applications.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/applications.js';

const mockListApplications = vi.mocked(listApplications);
const mockCreateApplication = vi.mocked(createApplication);
const mockUpdateApplication = vi.mocked(updateApplication);
const mockDeleteApplication = vi.mocked(deleteApplication);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('application commands', () => {
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

  describe('list-applications', () => {
    const cmd = findCommand('list-applications');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ applicationName: 'app1' }] };
      mockListApplications.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ applicationName: 'app1' }], expect.any(Array));
    });

    it('logs error on API failure', async () => {
      mockListApplications.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-application', () => {
    const cmd = findCommand('create-application');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        body: '{"applicationName":"app1","repositoryUrl":"https://github.com/test","revision":"main","path":"workflows"}',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('app1'))).toBe(true);
      expect(mockCreateApplication).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateApplication.mockResolvedValueOnce({
        success: true,
        data: { message: 'Created' },
      });

      await cmd.run({
        body: '{"applicationName":"app1","repositoryUrl":"https://github.com/test","revision":"main","path":"workflows"}',
        dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateApplication).toHaveBeenCalled();
    });
  });

  describe('update-application', () => {
    const cmd = findCommand('update-application');

    it('shows dry-run message', async () => {
      await cmd.run({
        name: 'app1', body: '{"revision":"develop"}',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('app1'))).toBe(true);
      expect(mockUpdateApplication).not.toHaveBeenCalled();
    });
  });

  describe('delete-application', () => {
    const cmd = findCommand('delete-application');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ name: 'app1', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('app1'))).toBe(true);
      expect(mockDeleteApplication).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ name: 'app1', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteApplication).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteApplication.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ name: 'app1', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteApplication).toHaveBeenCalledWith('app1');
    });
  });
});

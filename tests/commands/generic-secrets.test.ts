import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/generic-secrets.js', () => ({
  listGenericSecrets: vi.fn(),
  getGenericSecret: vi.fn(),
  createGenericSecret: vi.fn(),
  updateGenericSecret: vi.fn(),
  deleteGenericSecret: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listGenericSecrets,
  getGenericSecret,
  createGenericSecret,
  updateGenericSecret,
  deleteGenericSecret,
} from '../../src/api/generic-secrets.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/generic-secrets.js';

const mockListGenericSecrets = vi.mocked(listGenericSecrets);
const mockCreateGenericSecret = vi.mocked(createGenericSecret);
const mockUpdateGenericSecret = vi.mocked(updateGenericSecret);
const mockDeleteGenericSecret = vi.mocked(deleteGenericSecret);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('generic-secrets commands', () => {
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

  describe('list-secrets', () => {
    const cmd = findCommand('list-secrets');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ name: 'secret-1' }] };
      mockListGenericSecrets.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ name: 'secret-1' }], expect.any(Array));
    });

    it('logs error on API failure', async () => {
      mockListGenericSecrets.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-secret', () => {
    const cmd = findCommand('create-secret');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        body: '{"name":"my-secret","data":{"key":"value"}}',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockCreateGenericSecret).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateGenericSecret.mockResolvedValueOnce({
        success: true,
        data: { name: 'my-secret' },
      });

      await cmd.run({
        body: '{"name":"my-secret","data":{"key":"value"}}',
        dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateGenericSecret).toHaveBeenCalled();
      expect(logOutput.some(l => l.includes('my-secret'))).toBe(true);
    });
  });

  describe('update-secret', () => {
    const cmd = findCommand('update-secret');

    it('shows dry-run message', async () => {
      await cmd.run({
        name: 'my-secret', body: '{"data":{"key":"new-value"}}',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockUpdateGenericSecret).not.toHaveBeenCalled();
    });
  });

  describe('delete-secret', () => {
    const cmd = findCommand('delete-secret');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ name: 'my-secret', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockDeleteGenericSecret).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ name: 'my-secret', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteGenericSecret).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteGenericSecret.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ name: 'my-secret', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteGenericSecret).toHaveBeenCalledWith(
        'my-secret',
        undefined,
      );
    });
  });
});

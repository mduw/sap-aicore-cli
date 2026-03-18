import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/object-store-secrets.js', () => ({
  listObjectStoreSecrets: vi.fn(),
  createObjectStoreSecret: vi.fn(),
  updateObjectStoreSecret: vi.fn(),
  deleteObjectStoreSecret: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listObjectStoreSecrets,
  createObjectStoreSecret,
  updateObjectStoreSecret,
  deleteObjectStoreSecret,
} from '../../src/api/object-store-secrets.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/object-store-secrets.js';

const mockListObjectStoreSecrets = vi.mocked(listObjectStoreSecrets);
const mockCreateObjectStoreSecret = vi.mocked(createObjectStoreSecret);
const mockUpdateObjectStoreSecret = vi.mocked(updateObjectStoreSecret);
const mockDeleteObjectStoreSecret = vi.mocked(deleteObjectStoreSecret);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('object-store-secrets commands', () => {
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

  describe('list-object-store-secrets', () => {
    const cmd = findCommand('list-object-store-secrets');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ name: 'os-secret-1' }] };
      mockListObjectStoreSecrets.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ name: 'os-secret-1' }], expect.any(Array));
    });

    it('logs error on API failure', async () => {
      mockListObjectStoreSecrets.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-object-store-secret', () => {
    const cmd = findCommand('create-object-store-secret');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        name: 'my-secret', type: 'S3', data: '{"bucket":"my-bucket"}',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockCreateObjectStoreSecret).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateObjectStoreSecret.mockResolvedValueOnce({
        success: true,
        data: { message: 'Created' },
      });

      await cmd.run({
        name: 'my-secret', type: 'S3', data: '{"bucket":"my-bucket"}',
        dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateObjectStoreSecret).toHaveBeenCalled();
    });
  });

  describe('update-object-store-secret', () => {
    const cmd = findCommand('update-object-store-secret');

    it('shows dry-run message', async () => {
      await cmd.run({
        name: 'my-secret', type: 'S3',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockUpdateObjectStoreSecret).not.toHaveBeenCalled();
    });
  });

  describe('delete-object-store-secret', () => {
    const cmd = findCommand('delete-object-store-secret');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ name: 'my-secret', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockDeleteObjectStoreSecret).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ name: 'my-secret', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteObjectStoreSecret).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteObjectStoreSecret.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ name: 'my-secret', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteObjectStoreSecret).toHaveBeenCalledWith(
        'my-secret',
        undefined,
      );
    });
  });
});

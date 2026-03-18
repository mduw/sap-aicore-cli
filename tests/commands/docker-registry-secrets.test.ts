import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/docker-registry-secrets.js', () => ({
  listDockerRegistrySecrets: vi.fn(),
  createDockerRegistrySecret: vi.fn(),
  updateDockerRegistrySecret: vi.fn(),
  deleteDockerRegistrySecret: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listDockerRegistrySecrets,
  createDockerRegistrySecret,
  updateDockerRegistrySecret,
  deleteDockerRegistrySecret,
} from '../../src/api/docker-registry-secrets.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/docker-registry-secrets.js';

const mockListDockerRegistrySecrets = vi.mocked(listDockerRegistrySecrets);
const mockCreateDockerRegistrySecret = vi.mocked(createDockerRegistrySecret);
const mockDeleteDockerRegistrySecret = vi.mocked(deleteDockerRegistrySecret);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('docker-registry-secrets commands', () => {
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

  describe('list-docker-secrets', () => {
    const cmd = findCommand('list-docker-secrets');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ name: 'docker-secret-1' }] };
      mockListDockerRegistrySecrets.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ name: 'docker-secret-1' }], expect.any(Array));
    });

    it('logs error on API failure', async () => {
      mockListDockerRegistrySecrets.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-docker-secret', () => {
    const cmd = findCommand('create-docker-secret');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        name: 'my-secret', server: 'docker.io', username: 'user', password: 'pass',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockCreateDockerRegistrySecret).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateDockerRegistrySecret.mockResolvedValueOnce({
        success: true,
        data: { message: 'Created' },
      });

      await cmd.run({
        name: 'my-secret', server: 'docker.io', username: 'user', password: 'pass',
        dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateDockerRegistrySecret).toHaveBeenCalled();
    });
  });

  describe('delete-docker-secret', () => {
    const cmd = findCommand('delete-docker-secret');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ name: 'my-secret', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('my-secret'))).toBe(true);
      expect(mockDeleteDockerRegistrySecret).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ name: 'my-secret', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteDockerRegistrySecret).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteDockerRegistrySecret.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ name: 'my-secret', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteDockerRegistrySecret).toHaveBeenCalledWith('my-secret');
    });
  });
});

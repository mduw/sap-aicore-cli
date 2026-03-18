import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/dataset-files.js', () => ({
  uploadDatasetFile: vi.fn(),
  getDatasetFile: vi.fn(),
  deleteDatasetFile: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => Buffer.from('test content')),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => Buffer.from('test content')),
  writeFileSync: vi.fn(),
}));

import {
  uploadDatasetFile,
  getDatasetFile,
  deleteDatasetFile,
} from '../../src/api/dataset-files.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/dataset-files.js';

const mockUploadDatasetFile = vi.mocked(uploadDatasetFile);
const mockDeleteDatasetFile = vi.mocked(deleteDatasetFile);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('dataset-files commands', () => {
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

  describe('upload-dataset-file', () => {
    const cmd = findCommand('upload-dataset-file');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        remotePath: '/path/to/remote.csv', file: '/local/file.csv',
        resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]'))).toBe(true);
      expect(mockUploadDatasetFile).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockUploadDatasetFile.mockResolvedValueOnce({ success: true, data: { message: 'Uploaded' } });

      await cmd.run({
        remotePath: '/path/to/remote.csv', file: '/local/file.csv',
        resourceGroup: 'default', dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockUploadDatasetFile).toHaveBeenCalled();
      expect(logOutput.some(l => l.includes('uploaded'))).toBe(true);
    });
  });

  describe('delete-dataset-file', () => {
    const cmd = findCommand('delete-dataset-file');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        remotePath: '/path/to/file.csv', resourceGroup: 'default',
        dryRun: true, force: false, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]'))).toBe(true);
      expect(mockDeleteDatasetFile).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({
        remotePath: '/path/to/file.csv', resourceGroup: 'default',
        dryRun: false, force: false, json: false, _: [], $0: '',
      } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteDatasetFile).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteDatasetFile.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({
        remotePath: '/path/to/file.csv', resourceGroup: 'default',
        dryRun: false, force: true, json: false, _: [], $0: '',
      } as any);

      expect(mockDeleteDatasetFile).toHaveBeenCalledWith(
        '/path/to/file.csv',
        { 'AI-Resource-Group': 'default' },
      );
    });
  });
});

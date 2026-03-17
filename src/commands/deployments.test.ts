import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API layer
vi.mock('../api/deployments.js', () => ({
  listDeployments: vi.fn(),
  getDeployment: vi.fn(),
  createDeployment: vi.fn(),
  updateDeployment: vi.fn(),
  deleteDeployment: vi.fn(),
}));

// Mock table formatter to capture output
vi.mock('../utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listDeployments,
  getDeployment,
  createDeployment,
  updateDeployment,
  deleteDeployment,
} from '../api/deployments.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import commands from './deployments.js';

const mockListDeployments = vi.mocked(listDeployments);
const mockGetDeployment = vi.mocked(getDeployment);
const mockCreateDeployment = vi.mocked(createDeployment);
const mockUpdateDeployment = vi.mocked(updateDeployment);
const mockDeleteDeployment = vi.mocked(deleteDeployment);
const mockFormatTable = vi.mocked(formatTable);

// Helper to find a command by name
function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('deployment commands', () => {
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

  describe('list-deployments', () => {
    const cmd = findCommand('list-deployments');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ id: 'd1', status: 'RUNNING' }] };
      mockListDeployments.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ id: 'd1', status: 'RUNNING' }], expect.any(Array));
    });

    it('outputs JSON when --json flag is set', async () => {
      const mockData = { resources: [{ id: 'd1' }] };
      mockListDeployments.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ resourceGroup: 'default', json: true, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('"id"'))).toBe(true);
      expect(mockFormatTable).not.toHaveBeenCalled();
    });

    it('logs error on API failure', async () => {
      mockListDeployments.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ resourceGroup: 'default', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-deployment', () => {
    const cmd = findCommand('create-deployment');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ configId: 'cfg-1', resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('cfg-1'))).toBe(true);
      expect(mockCreateDeployment).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateDeployment.mockResolvedValueOnce({
        success: true,
        data: { id: 'd-new', status: 'PENDING' },
      });

      await cmd.run({ configId: 'cfg-1', resourceGroup: 'default', dryRun: false, json: false, _: [], $0: '' } as any);

      expect(mockCreateDeployment).toHaveBeenCalledWith('cfg-1', 'default');
      expect(logOutput.some(l => l.includes('d-new'))).toBe(true);
    });
  });

  describe('delete-deployment', () => {
    const cmd = findCommand('delete-deployment');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ id: 'd1', resourceGroup: 'default', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('d1'))).toBe(true);
      expect(mockDeleteDeployment).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ id: 'd1', resourceGroup: 'default', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteDeployment).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteDeployment.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ id: 'd1', resourceGroup: 'default', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteDeployment).toHaveBeenCalledWith('d1', 'default');
    });

    it('dry-run takes precedence over force', async () => {
      await cmd.run({ id: 'd1', resourceGroup: 'default', dryRun: true, force: true, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]'))).toBe(true);
      expect(mockDeleteDeployment).not.toHaveBeenCalled();
    });
  });

  describe('update-deployment', () => {
    const cmd = findCommand('update-deployment');

    it('shows dry-run message', async () => {
      await cmd.run({ id: 'd1', targetStatus: 'STOPPED', resourceGroup: 'default', dryRun: true, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('STOPPED'))).toBe(true);
      expect(mockUpdateDeployment).not.toHaveBeenCalled();
    });
  });
});

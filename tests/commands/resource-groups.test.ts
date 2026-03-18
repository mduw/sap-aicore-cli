import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/resource-groups.js', () => ({
  listResourceGroups: vi.fn(),
  getResourceGroup: vi.fn(),
  createResourceGroup: vi.fn(),
  updateResourceGroup: vi.fn(),
  deleteResourceGroup: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listResourceGroups,
  getResourceGroup,
  createResourceGroup,
  updateResourceGroup,
  deleteResourceGroup,
} from '../../src/api/resource-groups.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/resource-groups.js';

const mockListResourceGroups = vi.mocked(listResourceGroups);
const mockCreateResourceGroup = vi.mocked(createResourceGroup);
const mockUpdateResourceGroup = vi.mocked(updateResourceGroup);
const mockDeleteResourceGroup = vi.mocked(deleteResourceGroup);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('resource-groups commands', () => {
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

  describe('list-resource-groups', () => {
    const cmd = findCommand('list-resource-groups');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ resourceGroupId: 'rg1' }] };
      mockListResourceGroups.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ resourceGroupId: 'rg1' }], expect.any(Array));
    });

    it('logs error on API failure', async () => {
      mockListResourceGroups.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('create-resource-group', () => {
    const cmd = findCommand('create-resource-group');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({
        id: 'rg-new',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('rg-new'))).toBe(true);
      expect(mockCreateResourceGroup).not.toHaveBeenCalled();
    });

    it('calls API and shows success message', async () => {
      mockCreateResourceGroup.mockResolvedValueOnce({
        success: true,
        data: { resourceGroupId: 'rg-new' },
      });

      await cmd.run({
        id: 'rg-new',
        dryRun: false, json: false, _: [], $0: '',
      } as any);

      expect(mockCreateResourceGroup).toHaveBeenCalled();
      expect(logOutput.some(l => l.includes('rg-new'))).toBe(true);
    });
  });

  describe('update-resource-group', () => {
    const cmd = findCommand('update-resource-group');

    it('shows dry-run message', async () => {
      await cmd.run({
        id: 'rg1',
        dryRun: true, json: false, _: [], $0: '',
      } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('rg1'))).toBe(true);
      expect(mockUpdateResourceGroup).not.toHaveBeenCalled();
    });
  });

  describe('delete-resource-group', () => {
    const cmd = findCommand('delete-resource-group');

    it('shows dry-run message and does not call API', async () => {
      await cmd.run({ id: 'rg1', dryRun: true, force: false, json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('[Dry Run]') && l.includes('rg1'))).toBe(true);
      expect(mockDeleteResourceGroup).not.toHaveBeenCalled();
    });

    it('shows force warning when --force is not set', async () => {
      await cmd.run({ id: 'rg1', dryRun: false, force: false, json: false, _: [], $0: '' } as any);

      expect(warnOutput.some(l => l.includes('--force'))).toBe(true);
      expect(mockDeleteResourceGroup).not.toHaveBeenCalled();
    });

    it('calls API when --force is set', async () => {
      mockDeleteResourceGroup.mockResolvedValueOnce({ success: true, data: { message: 'OK' } });

      await cmd.run({ id: 'rg1', dryRun: false, force: true, json: false, _: [], $0: '' } as any);

      expect(mockDeleteResourceGroup).toHaveBeenCalledWith('rg1');
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/services.js', () => ({
  listServices: vi.fn(),
  getService: vi.fn(),
}));

vi.mock('../../src/utils/table-formatter.js', () => ({
  formatTable: vi.fn(),
}));

import {
  listServices,
  getService,
} from '../../src/api/services.js';
import { formatTable } from '../../src/utils/table-formatter.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/services.js';

const mockListServices = vi.mocked(listServices);
const mockGetService = vi.mocked(getService);
const mockFormatTable = vi.mocked(formatTable);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('services commands', () => {
  let logOutput: string[];
  let errorOutput: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    logOutput = [];
    errorOutput = [];
    vi.spyOn(logger, 'info').mockImplementation((msg: string) => { logOutput.push(msg); });
    vi.spyOn(logger, 'error').mockImplementation((msg: string) => { errorOutput.push(msg); });
    vi.spyOn(logger, 'success').mockImplementation((msg: string) => { logOutput.push(msg); });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('list-services', () => {
    const cmd = findCommand('list-services');

    it('calls formatTable with results on success', async () => {
      const mockData = { resources: [{ name: 'service1' }] };
      mockListServices.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ name: 'service1' }], expect.any(Array));
    });

    it('outputs JSON when --json flag is set', async () => {
      const mockData = { resources: [{ name: 'service1' }] };
      mockListServices.mockResolvedValueOnce({ success: true, data: mockData });

      await cmd.run({ json: true, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('service1'))).toBe(true);
      expect(mockFormatTable).not.toHaveBeenCalled();
    });

    it('logs error on API failure', async () => {
      mockListServices.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });

  describe('get-service', () => {
    const cmd = findCommand('get-service');

    it('calls formatTable on success', async () => {
      mockGetService.mockResolvedValueOnce({ success: true, data: { name: 'service1' } });

      await cmd.run({ name: 'service1', json: false, _: [], $0: '' } as any);

      expect(mockFormatTable).toHaveBeenCalledWith([{ name: 'service1' }], expect.any(Array));
    });

    it('logs error on failure', async () => {
      mockGetService.mockResolvedValueOnce({ success: false, error: 'Not found' });

      await cmd.run({ name: 'service1', json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Not found');
    });
  });
});

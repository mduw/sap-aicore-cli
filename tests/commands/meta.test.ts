import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/meta.js', () => ({
  getMeta: vi.fn(),
}));

import { getMeta } from '../../src/api/meta.js';
import { logger } from '../../src/utils/logger.js';
import commands from '../../src/commands/meta.js';

const mockGetMeta = vi.mocked(getMeta);

function findCommand(name: string) {
  const cmd = commands.find(c => c.name === name);
  if (!cmd) throw new Error(`Command ${name} not found`);
  return cmd;
}

describe('meta commands', () => {
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

  describe('get-meta', () => {
    const cmd = findCommand('get-meta');

    it('outputs meta data on success', async () => {
      mockGetMeta.mockResolvedValueOnce({ success: true, data: { capabilities: ['deployment'] } });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(logOutput.some(l => l.includes('deployment'))).toBe(true);
    });

    it('logs error on API failure', async () => {
      mockGetMeta.mockResolvedValueOnce({ success: false, error: 'Auth failed' });

      await cmd.run({ json: false, _: [], $0: '' } as any);

      expect(errorOutput).toContain('Auth failed');
    });
  });
});

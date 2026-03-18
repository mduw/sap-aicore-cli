import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatTable, type Column } from '../../src/utils/table-formatter.js';

describe('formatTable', () => {
  let output: string[];

  beforeEach(() => {
    output = [];
    vi.spyOn(console, 'log').mockImplementation((...args: any[]) => {
      output.push(args.join(' '));
    });
  });

  it('prints header, separator, and data rows', () => {
    const columns: Column<{ id: string; name: string }>[] = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 15 },
    ];
    const data = [
      { id: 'abc', name: 'Alpha' },
      { id: 'def', name: 'Beta' },
    ];

    formatTable(data, columns);

    expect(output.length).toBeGreaterThanOrEqual(4);
    expect(output[0]).toContain('ID');
    expect(output[0]).toContain('Name');
    expect(output[2]).toContain('abc');
    expect(output[2]).toContain('Alpha');
  });

  it('truncates values exceeding column width', () => {
    const columns: Column<{ val: string }>[] = [
      { header: 'Val', key: 'val', width: 5 },
    ];
    const data = [{ val: 'very-long-value' }];

    formatTable(data, columns);

    const dataRow = output[2];
    expect(dataRow.length).toBeLessThan(20);
  });

  it('prints empty message when data is empty', () => {
    const columns: Column<{ id: string }>[] = [
      { header: 'ID', key: 'id', width: 10 },
    ];

    formatTable([], columns);

    expect(output.some(line => line.includes('No results'))).toBe(true);
  });

  it('handles undefined/null values gracefully', () => {
    const columns: Column<{ id: string; name: string | undefined }>[] = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 10 },
    ];
    const data = [{ id: 'abc', name: undefined }];

    formatTable(data, columns);

    expect(output[2]).toContain('abc');
    expect(output[2]).toContain('-');
  });
});

import chalk from 'chalk';

export interface Column<T> {
  header: string;
  key: keyof T;
  width?: number;
}

const DEFAULT_WIDTH = 30;

function truncate(str: string, maxWidth: number): string {
  if (str.length <= maxWidth) return str;
  return str.substring(0, maxWidth - 2) + '..';
}

function pad(str: string, width: number): string {
  return str.padEnd(width);
}

export function formatTable<T extends Record<string, unknown>>(
  data: T[],
  columns: Column<T>[],
): void {
  if (data.length === 0) {
    console.log(chalk.dim('No results found.'));
    return;
  }

  const widths = columns.map(col => col.width ?? DEFAULT_WIDTH);

  const headerLine = columns.map((col, i) =>
    chalk.bold(pad(col.header, widths[i]))
  ).join('  ');
  console.log(headerLine);

  const separatorLine = widths.map(w => chalk.dim('─'.repeat(w))).join('  ');
  console.log(separatorLine);

  for (const row of data) {
    const line = columns.map((col, i) => {
      const val = row[col.key];
      const str = val === null || val === undefined ? '-' : String(val);
      return pad(truncate(str, widths[i]), widths[i]);
    }).join('  ');
    console.log(line);
  }

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

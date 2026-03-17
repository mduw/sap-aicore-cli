/**
 * Plugin-like command interface
 * Each command is self-contained and handles its own parsing, validation, and execution
 */

import type { ArgumentsCamelCase, Argv } from 'yargs';

export interface CommandPlugin {
  /**
   * Command name (used in CLI invocation)
   */
  readonly name: string;

  /**
   * Yargs builder function to define command-specific options
   * If not provided, the command will receive default global options
   */
  builder?(yargs: Argv): Argv;

  /**
   * Run the command with parsed yargs arguments
   * Command is responsible for:
   * 1. Validating configuration
   * 2. Executing the command logic
   */
  run(args: ArgumentsCamelCase<any>): Promise<void>;
}

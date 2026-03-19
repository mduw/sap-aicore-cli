#!/usr/bin/env node

/**
 * SAP AI Core CLI Helper
 *
 * Plugin-based CLI for managing SAP AI Core resources
 * Supports prompt templates, scenarios, and AI Core configurations
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import packageJson from '../package.json' with { type: 'json' };
import { getCommand, getCommandNames, getCommandMetadata } from './commands/index';
import { logger } from './utils/logger';
import type { CommandPlugin } from './types/command';

// Get package.json info
const VERSION = packageJson.version;
const DESCRIPTION = packageJson.description;

/**
 * Cache for config initialization
 * Only initialized once when a command needs it
 */
let configInitialized = false;

/**
 * Initialize config and CDS environment (lazy, runs once)
 */
async function initializeConfig(): Promise<void> {
  if (configInitialized) {
    return;
  }

  // Set up CDS environment to use hybrid profile
  process.env.CDS_ENV = 'hybrid';

  // Lazy imports for heavy modules
  const { loadGlobalConfig, setupVcapFromGlobalConfig, getConfigSource } = await import('./utils/config');
  const cds = (await import('@sap/cds')).default;

  // Load global config first (from multiple sources with priority)
  const globalConfig = await loadGlobalConfig();
  if (globalConfig?.aicore) {
    const source = getConfigSource();
    logger.debug(`Loading AI Core credentials from: ${source}`);
    setupVcapFromGlobalConfig(globalConfig.aicore);
  }

  // Resolve CF service bindings and populate VCAP_SERVICES for SAP AI SDK
  try {
    const aicore = await cds.connect.to('aicore') as any;

    if (aicore?.options?.binding?.type === 'cf') {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const binding = aicore.options.binding;
      const cfCommand = `cf service-key ${binding.instance} ${binding.key}`;

      try {
        const { stdout } = await execAsync(cfCommand);
        const jsonStart = stdout.indexOf('{');
        if (jsonStart > 0) {
          const serviceKey = JSON.parse(stdout.substring(jsonStart));
          if (serviceKey.credentials) {
            const vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');
            vcapServices.aicore = [{
              name: 'aicore',
              label: 'aicore',
              tags: ['aicore'],
              credentials: serviceKey.credentials
            }];
            process.env.VCAP_SERVICES = JSON.stringify(vcapServices);
          }
        }
      } catch {
        // CF command failed - operations will handle error
      }
    }
  } catch {
    // Service connection failed - operations will handle error
  }

  configInitialized = true;
}

/**
 * Build grouped command help text from command metadata.
 */
function buildGroupedHelp(commands: Array<{ name: string; description: string; group: string; usage?: string }>): string {
  const groups = new Map<string, Array<{ usage: string; description: string }>>();

  for (const cmd of commands) {
    const group = cmd.group;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push({
      usage: cmd.usage ?? cmd.name,
      description: cmd.description,
    });
  }

  let text = '';
  for (const [group, cmds] of groups) {
    text += `\n  ${chalk.yellow(group + ':')}\n`;
    for (const cmd of cmds) {
      const padded = ('saic-cli ' + cmd.usage).padEnd(46);
      text += `    ${chalk.cyan(padded)} ${chalk.dim(cmd.description)}\n`;
    }
  }

  return text;
}

/**
 * Main execution - Use yargs for routing and parsing
 */
async function main(): Promise<void> {
  const commands = getCommandMetadata();
  const groupedHelp = buildGroupedHelp(commands);

  const cli = yargs(hideBin(process.argv))
    .scriptName('saic-cli')
    .version(VERSION)
    .usage(
      `${chalk.cyan.bold('SAP AI Core CLI')} ${chalk.dim('v' + VERSION)}\n` +
      `${chalk.dim(DESCRIPTION)}\n\n` +
      `${chalk.yellow.bold('Usage:')}\n` +
      `  ${chalk.cyan('saic-cli')} ${chalk.green.bold('<command>')} ${chalk.dim('[options]')}\n\n` +
      `${chalk.yellow.bold('Commands:')}` +
      groupedHelp
    )
    .option('debug', {
      describe: 'Enable debug logging',
      type: 'boolean',
      global: true,
      default: false
    })
    .option('verbose', {
      describe: 'Show detailed output',
      type: 'boolean',
      global: true,
      default: false
    })
    .option('dry-run', {
      describe: 'Preview action without executing (where applicable)',
      type: 'boolean',
      global: true,
      default: false
    })
    .middleware(async (argv) => {
      // Enable debug logging if flag is set
      if (argv.debug) {
        logger.enableDebug();
      }
    })
    .demandCommand(1, chalk.red('\n✗ Error: Please specify a command\n'))
    .recommendCommands()
    .strict()
    .help('help')
    .alias('help', 'h')
    .epilogue(
      `\n${chalk.dim('─'.repeat(60))}\n` +
      `${chalk.cyan('ℹ')}  Use ${chalk.cyan.bold('saic-cli <command> --help')} for detailed command information`
    );

  // Register all commands with yargs (hidden from default help — we render our own)
  for (const cmdMeta of commands) {
    cli.command(
      cmdMeta.usage ?? cmdMeta.name,
      false as any, // false hides from yargs' default command list
      // builder function
      async (yargs) => {
        const command = await getCommand(cmdMeta.name);
        if (!command) {
          logger.error(`Failed to load command: ${cmdMeta.name}`);
          process.exit(1);
        }

        if (command.builder) {
          return command.builder(yargs);
        }
        return yargs;
      },
      // handler function
      async (argv) => {
        try {
          await initializeConfig();

          const command = await getCommand(cmdMeta.name);
          if (!command) {
            logger.error(`Failed to load command: ${cmdMeta.name}`);
            process.exit(1);
          }

          await command.run(argv);
        } catch (error) {
          const err = error as Error;
          logger.error(`Error executing ${cmdMeta.name}: ${err.message}`);
          if (logger.isDebug() && err.stack) {
            logger.debug('Stack trace:');
            logger.debug(err.stack);
          }
          process.exit(1);
        }
      }
    );
  }

  await cli.parse();
}

// Execute main function
main().catch((error: unknown) => {
  const err = error as Error;
  logger.error(`Fatal error: ${err.message}`);
  if (logger.isDebug() && err.stack) {
    logger.debug('Stack trace:');
    logger.debug(err.stack);
  }
  process.exit(1);
});

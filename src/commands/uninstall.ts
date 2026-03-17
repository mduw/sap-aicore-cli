/**
 * Uninstall command - Remove CLI from global installation
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import type { Argv, ArgumentsCamelCase } from 'yargs';
import type { CommandPlugin } from '../types/command';
import { logger } from '../utils/logger';
import { hasAnyConfig, loadGlobalConfig, saveGlobalConfig, getConfigPath } from '../utils/config';
import { CommandNames } from './index';

const execAsync = promisify(exec);

/**
 * Uninstall command - Remove global npm link and clear configuration
 */
class UninstallCommand implements CommandPlugin {
  name = CommandNames.UNINSTALL;

  builder(yargs: Argv): Argv {
    return yargs
      .option('keep-config', {
        describe: 'Keep configuration files (don\'t clear config)',
        type: 'boolean',
        default: false
      })
      .example('$0 uninstall', 'Uninstall CLI globally and clear config')
      .example('$0 uninstall --keep-config', 'Uninstall but keep configuration');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    logger.banner('Uninstalling SAP AI Core CLI');

    const keepConfig = args.keepConfig as boolean;

    try {
      // Step 1: Clear configuration (unless --keep-config)
      if (!keepConfig && hasAnyConfig()) {
        logger.info('Step 1: Clearing configuration...');

        const existing = await loadGlobalConfig();
        if (existing?.aicore) {
          logger.info(`  Config: ${chalk.dim(existing.aicore.serviceurls.AI_API_URL)}`);
        }

        await saveGlobalConfig({});
        logger.success(`✓ Configuration cleared from ${chalk.cyan(getConfigPath())}\n`);
      } else if (keepConfig) {
        logger.info('Step 1: Keeping configuration files (--keep-config)\n');
      } else {
        logger.info('Step 1: No configuration found to clear\n');
      }

      // Step 2: Remove global link
      logger.info('Step 2: Removing global link...');

      try {
        await execAsync('npm unlink -g sap-ai-core-cli');
      } catch {
        // Try alternative unlink method
        await execAsync('npm unlink');
      }

      logger.success('✓ Global link removed\n');

      logger.success('🎉 Uninstallation complete!');
      logger.info('');
      logger.info('The ' + chalk.cyan('saic-cli') + ' command has been removed from your system.');
      logger.info('');

    } catch (error: any) {
      logger.error(`\nUninstallation failed: ${error.message}`);
      logger.info('');
      logger.info('Try running manually:');
      logger.info(chalk.cyan('  npm unlink -g sap-ai-core-cli'));
      logger.info('or');
      logger.info(chalk.cyan('  npm unlink'));
      process.exit(1);
    }
  }
}

export default new UninstallCommand();

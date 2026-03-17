/**
 * Install command - Build and link CLI globally for local development
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import type { Argv, ArgumentsCamelCase } from 'yargs';
import type { CommandPlugin } from '../types/command';
import { logger } from '../utils/logger';
import { CommandNames } from './index';

const execAsync = promisify(exec);

/**
 * Install command - Automate build and npm link
 */
class InstallCommand implements CommandPlugin {
  name = CommandNames.INSTALL;

  builder(yargs: Argv): Argv {
    return yargs
      .example('$0 install', 'Install CLI globally after cloning repo');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    logger.banner('Installing SAP AI Core CLI');

    try {
      // Step 1: Build
      logger.info('Step 1: Building project...');
      await execAsync('npm run build');
      logger.success('✓ Build complete\n');

      // Step 2: Link globally
      logger.info('Step 2: Linking globally...');
      const { stdout } = await execAsync('npm link');
      logger.success('✓ Linked globally\n');

      // Show what was linked
      const linkMatch = stdout.match(/(\S+) -> (\S+)/);
      if (linkMatch) {
        logger.info(`  ${chalk.cyan(linkMatch[1])} → ${chalk.dim(linkMatch[2])}`);
      }

      // Success!
      logger.success('\n🎉 Installation complete!');
      logger.info('');
      logger.info('The ' + chalk.cyan('saic-cli') + ' command is now available globally.');
      logger.info('');
      logger.info('Next steps:');
      logger.info(chalk.cyan('  1. Run: saic-cli setup'));
      logger.info(chalk.cyan('  2. Start using: saic-cli list-scenarios'));
      logger.info('');

    } catch (error: any) {
      logger.error(`\nInstallation failed: ${error.message}`);
      logger.info('');
      logger.info('Try running manually:');
      logger.info(chalk.cyan('  npm run build'));
      logger.info(chalk.cyan('  npm link'));
      process.exit(1);
    }
  }
}

export default new InstallCommand();

/**
 * Setup command - Automated onboarding
 * Guides users through CF login, service binding, and config setup
 */

import chalk from 'chalk';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command';
import {
  getConfigPath,
  hasAnyConfig,
  loadGlobalConfig,
  loadLocalCdsConfig,
  saveGlobalConfig
} from '../utils/config';
import { logger } from '../utils/logger';
import { CommandNames } from './index';

const execAsync = promisify(exec);

/**
 * Setup command - Interactive setup wizard
 */
class SetupCommand implements CommandPlugin {
  name = CommandNames.SETUP;

  builder(yargs: Argv): Argv {
    return yargs
      .option('force', {
        describe: 'Force re-setup even if config exists',
        type: 'boolean',
        default: false
      })
      .option('reset', {
        describe: 'Remove all configuration',
        type: 'boolean',
        default: false
      })
      .strict(false)  // Allow pass-through args for cf login
      .parserConfiguration({
        'unknown-options-as-args': false,
        'populate--': true  // Capture args after -- in argv['--']
      })
      .epilogue(chalk.dim('\nNote: All arguments except --force and --reset are passed through to \'cf login\' command.'))
      .example('$0 setup', 'Interactive setup (recommended for first-time users)')
      .example('$0 setup --sso', 'Setup with SSO login')
      .example('$0 setup -a https://api.cf.<region>.hana.ondemand.com --sso', 'Setup with specific API endpoint')
      .example('$0 setup --reset', 'Reset/clear configuration');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    // Extract known options
    const force = args.force as boolean;
    const reset = args.reset as boolean;

    // Build CF login args from parsed yargs object
    // Extract all unknown flags and their values
    const knownOptions = ['force', 'reset', 'debug', 'verbose', 'dryRun', 'dry-run', 'help', '_', '$0'];
    const cfLoginArgs: string[] = [];

    for (const [key, value] of Object.entries(args)) {
      // Skip known options
      if (knownOptions.includes(key)) continue;

      // Handle boolean flags (like --sso)
      if (typeof value === 'boolean' && value) {
        cfLoginArgs.push(key.length === 1 ? `-${key}` : `--${key}`);
      }
      // Handle string/number values (like -a https://...)
      else if (value !== undefined && value !== false) {
        cfLoginArgs.push(key.length === 1 ? `-${key}` : `--${key}`);
        cfLoginArgs.push(String(value));
      }
    }

    // Add positional arguments (from args._)
    if (Array.isArray(args._) && args._.length > 0) {
      // Skip the first positional arg which is the command name 'setup'
      cfLoginArgs.push(...args._.slice(1).map(String));
    }

    // Log what args we're passing through (in debug mode)
    if (cfLoginArgs.length > 0) {
      logger.debug(`CF Login args: ${cfLoginArgs.join(' ')}`);
    }

    // Handle reset
    if (reset) {
      await this.resetConfig();
      return;
    }

    logger.banner('SAP AI Core CLI Setup');

    // Show appropriate message based on existing config
    if (hasAnyConfig()) {
      logger.info('Reconfiguring existing setup...\n');
    } else {
      logger.info('This wizard will help you set up SAP AI Core CLI.\n');
    }

    try {
      // Step 1: Check CF login
      await this.checkCfLogin(cfLoginArgs);

      // Step 2: Create/verify service binding
      await this.setupServiceBinding();

      // Step 3: Initialize global config
      await this.initializeConfig();

      // Success!
      logger.success('\n🎉 Setup complete!');
      logger.info('');
      logger.info('You can now use saic-cli commands from any directory:');
      logger.info(chalk.cyan('  saic-cli list-scenarios'));
      logger.info(chalk.cyan('  saic-cli list-templates'));
      logger.info(chalk.cyan('  saic-cli create-prompt --dir ./my-template'));
      logger.info('');

    } catch (error: any) {
      logger.error(`\nSetup failed: ${error.message}`);
      logger.info('');

      // Provide context-specific guidance
      if (error.message.includes('CF token expired') || error.message.includes('token expired')) {
        // Token-specific error already provided above
      } else {
        logger.info('For manual setup:');
        logger.info(chalk.cyan('  1. cf login --sso (or with credentials)'));
        logger.info(chalk.cyan('  2. cds bind -2 aicore'));
        logger.info(chalk.cyan('  3. saic-cli setup'));
        logger.info('');
      }

      process.exit(1);
    }
  }

  private async resetConfig(): Promise<void> {
    logger.banner('Reset Configuration');

    if (!hasAnyConfig()) {
      logger.info('No configuration found to reset.');
      return;
    }

    const existing = await loadGlobalConfig();
    if (existing?.aicore) {
      logger.info(`Current config: ${chalk.cyan(existing.aicore.serviceurls.AI_API_URL)}\n`);
    }

    // Clear config
    await saveGlobalConfig({});

    logger.success('✓ Configuration cleared from ' + chalk.cyan(getConfigPath()));
    logger.info('');
    logger.info('Run ' + chalk.cyan('saic-cli setup') + ' to reconfigure.');
  }

  private async checkCfLogin(cfLoginArgs: string[] = []): Promise<void> {
    logger.info('Step 1: Checking Cloud Foundry login...');

    // First, logout to clear any stale tokens
    try {
      logger.info('  Clearing existing CF session...');
      await execAsync('cf logout', { timeout: 5000 });
      logger.info('  ✓ Logged out from previous session\n');
    } catch (logoutError) {
      // Ignore logout errors (might not be logged in)
      logger.debug('Logout skipped (may not have been logged in)');
    }

    try {
      const { stdout } = await execAsync('cf target');

      // Parse CF target output
      const apiMatch = stdout.match(/api endpoint:\s+(.+)/i);
      const orgMatch = stdout.match(/org:\s+(.+)/i);
      const spaceMatch = stdout.match(/space:\s+(.+)/i);

      if (apiMatch && orgMatch && spaceMatch) {
        logger.success('✓ Logged in to Cloud Foundry');
        logger.info(`  Org: ${chalk.dim(orgMatch[1].trim())}`);
        logger.info(`  Space: ${chalk.dim(spaceMatch[1].trim())}`);
        logger.info('');
        return;
      } else {
        throw new Error('Unable to verify CF target');
      }
    } catch {
      // Not logged in - prompt for interactive login
      logger.warn('⚠ Not logged in to Cloud Foundry');
      logger.info('');

      if (cfLoginArgs.length > 0) {
        logger.info(`Starting CF login with: ${cfLoginArgs.join(' ')}`);
      } else {
        logger.info('Starting interactive CF login...');
      }
      logger.info('');

      await this.runCfLogin(cfLoginArgs);

      // Verify login was successful
      try {
        const { stdout } = await execAsync('cf target');
        const orgMatch = stdout.match(/org:\s+(.+)/i);
        const spaceMatch = stdout.match(/space:\s+(.+)/i);

        if (orgMatch && spaceMatch) {
          logger.info('');
          logger.success('✓ Successfully logged in to Cloud Foundry');
          logger.info(`  Org: ${chalk.dim(orgMatch[1].trim())}`);
          logger.info(`  Space: ${chalk.dim(spaceMatch[1].trim())}`);
          logger.info('');
        } else {
          throw new Error('CF login verification failed');
        }
      } catch {
        throw new Error('Cloud Foundry login was not completed successfully');
      }
    }
  }

  private async runCfLogin(cfLoginArgs: string[] = []): Promise<void> {
    // Flush stdout/stderr before spawning
    if (process.stdout.write('')) {
      process.stdout.write('');
    }

    return new Promise((resolve, reject) => {
      const cfLogin = spawn('cf', ['login', ...cfLoginArgs], {
        stdio: 'inherit',
        env: process.env
      });

      cfLogin.on('error', (error) => {
        reject(new Error(`Failed to run cf login: ${error.message}`));
      });

      cfLogin.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('CF login was cancelled or failed'));
        }
      });
    });
  }

  private async setupServiceBinding(): Promise<void> {
    logger.info('Step 2: Setting up AI Core service binding...');

    try {
      // Check if aicore service exists
      const { stdout: services } = await execAsync('cf services');

      if (!services.includes('aicore')) {
        logger.warn('⚠ No "aicore" service instance found');
        logger.info('');
        logger.info('Please create an AI Core service instance first.');
        logger.info('Then run: ' + chalk.cyan('cf bind-service <app> aicore'));
        logger.info('');
        throw new Error('AI Core service instance not found');
      }

      // Try to bind with CDS
      logger.info('  Creating service binding with CDS...');

      try {
        await execAsync('cds bind -2 aicore');
        logger.success('✓ Service binding created');
        logger.info('');
      } catch (bindError: any) {
        // Check if binding already exists
        if (bindError.message.includes('already exists') || bindError.message.includes('existing')) {
          logger.success('✓ Service binding already exists');
          logger.info('');
        } else {
          throw bindError;
        }
      }
    } catch (error: any) {
      // Check if it's a token expiration error during the step
      if (error.message.includes('token expired') ||
          error.message.includes('was revoked') ||
          error.message.includes('Please log back in')) {
        logger.error('❌ CF token expired during service binding\n');
        logger.info('Your token expired while running CF commands.');
        logger.info(chalk.cyan('Please run saic-cli setup again'));
        logger.info('');
        throw new Error('CF token expired');
      }

      if (error.message.includes('not found')) {
        throw error;
      }

      logger.warn('⚠ Could not create service binding automatically');
      logger.info('');
      logger.info('Please run manually:');
      logger.info(chalk.cyan('  cds bind -2 aicore'));
      logger.info('');
      throw error;
    }
  }

  private async initializeConfig(): Promise<void> {
    logger.info('Step 3: Initializing global configuration...');

    const credentials = await loadLocalCdsConfig();

    if (!credentials) {
      throw new Error('Could not load AI Core credentials from .cdsrc-private.json');
    }

    logger.success('✓ Found AI Core credentials');
    logger.info(`  Service URL: ${chalk.cyan(credentials.serviceurls.AI_API_URL)}`);
    logger.info('');

    // Save to global config
    await saveGlobalConfig({ aicore: credentials });

    logger.success(`✓ Saved to: ${chalk.cyan(getConfigPath())}`);
  }
}

export default new SetupCommand();

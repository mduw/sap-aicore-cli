/**
 * List-scenarios command plugin
 */

import type { ArgumentsCamelCase, Argv } from 'yargs';
import { fetchAllScenarios } from '../api/prompt-registry';
import type { CommandPlugin } from '../types/command';
import type { ScenarioInfo } from '../types/template';
import { logger } from '../utils/logger';
import { CommandNames } from './index';

/**
 * List-scenarios command - uses yargs for parsing
 */
class ListScenariosCommand implements CommandPlugin {
  name = CommandNames.LIST_SCENARIOS;

  builder(yargs: Argv): Argv {
    return yargs
      .option('info', {
        describe: 'Show detailed scenario information',
        type: 'boolean',
        default: false
      })
      .example('$0 list-scenarios', 'List all scenarios')
      .example('$0 list-scenarios --info', 'Show detailed information');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const verbose = args.info as boolean;

    await this.execute({ verbose });
  }

  private async execute(config: { verbose: boolean }): Promise<void> {
    const options = { dryRun: false, verbose: config.verbose };

    logger.banner('Listing Available Scenarios');

    logger.info('Fetching scenarios from prompt registry...\n');

    const result = await fetchAllScenarios(options);

    if (!result.success) {
      logger.error(`Error: ${result.error.message}`);
      return;
    }

    if (result.data.length === 0) {
      logger.info('No scenarios found in the registry.');
      return;
    }

    logger.info(`Found ${result.data.length} scenario(s):\n`);

    if (config.verbose) {
      // Verbose mode: show full details as JSON
      logger.info(JSON.stringify(result.data, null, 2));
    } else {
      // Concise mode: show scenario IDs with template counts
      result.data.forEach((scenario: ScenarioInfo, index: number) => {
        logger.info(`${index + 1}. ${scenario.id}`);
        logger.info(`   Templates: ${scenario.templateCount}`);
        logger.info('');
      });
    }
  }
}

export default new ListScenariosCommand();

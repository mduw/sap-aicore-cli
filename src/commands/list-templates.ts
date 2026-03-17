/**
 * List-templates command plugin
 */

import type { Argv, ArgumentsCamelCase } from 'yargs';
import { fetchTemplates } from '../api/prompt-registry';
import type { CommandPlugin } from '../types/command';
import { logger } from '../utils/logger';
import { CommandNames } from './index';

/**
 * List-templates command - uses yargs for parsing
 */
class ListTemplatesCommand implements CommandPlugin {
  name = CommandNames.LIST_TEMPLATES;

  builder(yargs: Argv): Argv {
    return yargs
      .option('scenario', {
        describe: 'Filter by scenario ID (optional, can specify multiple)',
        type: 'array',
        string: true,
        default: []
      })
      .option('info', {
        describe: 'Show detailed template information',
        type: 'boolean',
        alias: 'verbose',
        default: false
      })
      .example('$0 list-templates', 'List all templates')
      .example('$0 list-templates --scenario AIU_SUMMARIZATION', 'List templates for specific scenario')
      .example('$0 list-templates --info', 'Show detailed information');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const scenarios = (args.scenario as string[]) || [];
    const verbose = args.info as boolean;

    await this.execute({ scenarios, verbose });
  }

  private async execute(config: { scenarios: string[]; verbose: boolean }): Promise<void> {
    const options = { dryRun: false, verbose: config.verbose };

    logger.banner('Listing Prompt Templates');

    // If no scenarios specified, list all templates
    if (config.scenarios.length === 0) {
      logger.info('Fetching all templates...\n');
      const result = await fetchTemplates(undefined, options);

      if (!result.success) {
        logger.error(`Error: ${result.error.message}`);
        return;
      }

      if (result.data.length === 0) {
        logger.info('No templates found.');
        return;
      }

      logger.info(`Found ${result.data.length} template(s):\n`);
      this.displayTemplates(result.data, config.verbose);
      return;
    }

    // List templates for specific scenarios
    for (const scenarioId of config.scenarios) {
      logger.separator();
      logger.info(`Scenario: ${scenarioId}`);
      logger.separator();

      const result = await fetchTemplates(scenarioId, options);

      if (!result.success) {
        logger.error(`Error: ${result.error.message}`);
        continue;
      }

      if (result.data.length === 0) {
        logger.info('No templates found for this scenario.');
        continue;
      }

      logger.info(`Found ${result.data.length} template(s):\n`);
      this.displayTemplates(result.data, config.verbose);
    }
  }

  private displayTemplates(templates: any[], verbose: boolean): void {
    if (verbose) {
      // Verbose mode: show full JSON
      logger.info(JSON.stringify(templates, null, 2));
    } else {
      // Concise mode: show table-like format
      templates.forEach((template, index) => {
        logger.info(`${index + 1}. ${template.name || 'Unnamed'} (v${template.version || 'N/A'})`);
        logger.info(`   ID: ${template.id}`);
        if (template.scenario) {
          logger.info(`   Scenario: ${template.scenario}`);
        }
        logger.info('');
      });
    }
  }
}

export default new ListTemplatesCommand();

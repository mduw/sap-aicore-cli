/**
 * Delete command plugin
 */

import type { Argv, ArgumentsCamelCase } from 'yargs';
import { deleteScenarioTemplates, deleteSpecificTemplate } from '../api/prompt-registry';
import { displayBanner, displaySummary } from '../display';
import type { ResultSummary } from '../types/display';
import type { CommandPlugin } from '../types/command';
import { logger } from '../utils/logger';
import { CommandNames } from './index';

interface DeleteOptions {
  scenarios: string[];
  templateName?: string;
  templateVersion?: string;
  dryRun: boolean;
  verbose: boolean;
}

/**
 * Delete command - uses yargs for parsing
 */
class DeleteCommand implements CommandPlugin {
  name = CommandNames.DELETE;

  builder(yargs: Argv): Argv {
    return yargs
      .option('scenario', {
        describe: 'Scenario ID(s) to delete (can specify multiple)',
        type: 'array',
        string: true,
        default: []
      })
      .option('t', {
        describe: 'Template name to delete (requires -v)',
        type: 'string'
      })
      .option('v', {
        describe: 'Template version to delete (requires -t)',
        type: 'string'
      })
      .option('dry-run', {
        describe: 'Preview action without executing',
        type: 'boolean',
        default: false
      })
      .option('verbose', {
        describe: 'Show detailed output',
        type: 'boolean',
        default: false
      })
      .check((argv) => {
        const hasScenarios = argv.scenario && (argv.scenario as string[]).length > 0;
        const hasTemplate = !!(argv.t && argv.v);

        // Must specify either scenarios or template name+version
        if (!hasScenarios && !hasTemplate) {
          throw new Error('Delete command requires either --scenario or both -t and -v');
        }

        // Cannot specify both modes
        if (hasScenarios && hasTemplate) {
          throw new Error('Cannot use --scenario with -t/-v. Choose one deletion mode.');
        }

        // If template name is specified, version must also be specified
        if ((argv.t && !argv.v) || (!argv.t && argv.v)) {
          throw new Error('Both -t and -v are required when deleting a specific template');
        }

        return true;
      })
      .example('$0 delete --scenario AIU_SUMMARIZATION', 'Delete all templates in a scenario')
      .example('$0 delete -t MY_PROMPT -v 1.0.0', 'Delete a specific template');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const config: DeleteOptions = {
      scenarios: (args.scenario as string[]) || [],
      templateName: args.t as string | undefined,
      templateVersion: args.v as string | undefined,
      dryRun: args.dryRun as boolean,
      verbose: args.verbose as boolean
    };

    await this.execute(config);
  }

  private async execute(config: DeleteOptions): Promise<void> {
    const options = { dryRun: config.dryRun, verbose: config.verbose };
    const isTemplateMode = !!(config.templateName && config.templateVersion);

    if (isTemplateMode) {
      // Delete specific template
      displayBanner({
        mode: config.dryRun ? '🔍 DRY RUN (no changes)' : '🗑️  DELETE TEMPLATE',
        verbose: config.verbose,
        scenarios: [`${config.templateName} v${config.templateVersion}`]
      });

      if (config.dryRun) {
        logger.info('\n⚠️ Running in DRY RUN mode - no templates will be deleted');
      } else {
        logger.info('\n⚠️ WARNING: This will permanently delete the specified template!');
      }

      const result = await deleteSpecificTemplate(
        config.templateName!,
        config.templateVersion!,
        options
      );

      if (!result.success) {
        logger.error(`Fatal error: ${result.error.message}`);
        process.exit(1);
      }

      displaySummary([
        { scenarioId: `${config.templateName} v${config.templateVersion}`, results: result.data }
      ], { dryRun: config.dryRun });

    } else {
      // Delete by scenarios
      displayBanner({
        mode: config.dryRun ? '🔍 DRY RUN (no changes)' : '🗑️  DELETE SCENARIOS',
        verbose: config.verbose,
        scenarios: config.scenarios
      });

      if (config.dryRun) {
        logger.info('\n⚠️ Running in DRY RUN mode - no templates will be deleted');
      } else {
        logger.info('\n⚠️ WARNING: This will permanently delete all templates in the specified scenario(s)!');
      }

      const allResults: ResultSummary[] = [];

      for (const scenarioId of config.scenarios) {
        const result = await deleteScenarioTemplates(scenarioId, options);

        if (!result.success) {
          logger.error(`Fatal error processing ${scenarioId}: ${result.error.message}`);
          process.exit(1);
        }

        allResults.push({ scenarioId, results: result.data });
      }

      displaySummary(allResults, { dryRun: config.dryRun });
    }

    logger.info('\n✨ Command completed\n');
  }
}

export default new DeleteCommand();

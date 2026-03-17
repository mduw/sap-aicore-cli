import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import { logger } from '../utils/logger.js';
import {
  listMetrics,
  deleteMetrics,
} from '../api/metrics.js';

class ListMetricsCommand implements CommandPlugin {
  readonly name = 'list-metrics';

  builder(yargs: Argv): Argv {
    return yargs
      .option('execution-id', {
        describe: 'Filter by execution ID',
        type: 'string',
      })
      .option('resource-group', {
        describe: 'AI resource group',
        type: 'string',
        default: 'default',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const resourceGroup = args.resourceGroup as string;
    const result = await listMetrics(resourceGroup, {
      executionId: args.executionId as string | undefined,
    });

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const metrics = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(metrics, null, 2));
      return;
    }

    // Metrics have varied structure, so JSON output is more useful
    logger.info(JSON.stringify(metrics, null, 2));
  }
}

class DeleteMetricsCommand implements CommandPlugin {
  readonly name = 'delete-metrics';

  builder(yargs: Argv): Argv {
    return yargs
      .option('execution-id', {
        describe: 'Execution ID whose metrics to delete',
        type: 'string',
        demandOption: true,
      })
      .option('resource-group', {
        describe: 'AI resource group',
        type: 'string',
        default: 'default',
      })
      .option('force', {
        describe: 'Skip confirmation warning',
        type: 'boolean',
        default: false,
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const executionId = args.executionId as string;
    const resourceGroup = args.resourceGroup as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would delete metrics for execution ${executionId}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete all metrics for execution ${executionId}. Use --force to confirm.`,
      );
      return;
    }

    const result = await deleteMetrics(executionId, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Metrics for execution ${executionId} deleted successfully.`);
  }
}

export default [
  new ListMetricsCommand(),
  new DeleteMetricsCommand(),
];

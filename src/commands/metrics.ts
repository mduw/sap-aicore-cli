import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  listMetrics,
  deleteMetrics,
} from '../api/metrics.js';

class ListMetricsCommand implements CommandPlugin {
  readonly name = 'list-metrics';

  builder(yargs: Argv): Argv {
    return yargs
      .option('query', {
        describe: 'Query parameters (JSON), e.g. \'{"executionIds":["exec-1"]}\'',
        type: 'string',
      })
      .option('headers', {
        describe: 'Header parameters (JSON)',
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
    const { query, headers } = parseSdkParams(args);
    const result = await listMetrics(query, headers);

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
      .option('query', {
        describe: 'Query parameters (JSON), must include "executionId", e.g. \'{"executionId":"exec-1"}\'',
        type: 'string',
        demandOption: true,
      })
      .option('headers', {
        describe: 'Header parameters (JSON)',
        type: 'string',
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
    const { query, headers } = parseSdkParams(args);

    if (!query.executionId) {
      logger.error('--query must include "executionId", e.g. --query \'{"executionId":"exec-1"}\'');
      return;
    }

    if (args.dryRun) {
      logger.info(`[Dry Run] Would delete metrics for execution ${query.executionId}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete all metrics for execution ${query.executionId}. Use --force to confirm.`,
      );
      return;
    }

    const result = await deleteMetrics(query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Metrics for execution ${query.executionId} deleted successfully.`);
  }
}

export default [
  new ListMetricsCommand(),
  new DeleteMetricsCommand(),
];

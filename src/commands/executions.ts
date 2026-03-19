import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  listExecutions,
  getExecution,
  createExecution,
  updateExecution,
  deleteExecution,
} from '../api/executions.js';

const executionColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Configuration', key: 'configurationId', width: 36 },
  { header: 'Scenario', key: 'scenarioId', width: 24 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Created', key: 'createdAt', width: 20 },
];

class ListExecutionsCommand implements CommandPlugin {
  readonly name = 'list-executions';

  builder(yargs: Argv): Argv {
    return yargs
      .option('query', {
        describe: 'Query parameters (JSON), e.g. \'{"status":"COMPLETED","scenarioId":"s1","$top":10}\'',
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
    const result = await listExecutions(query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const executions = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(executions, null, 2));
      return;
    }

    formatTable(executions, executionColumns);
  }
}

class GetExecutionCommand implements CommandPlugin {
  readonly name = 'get-execution';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Execution ID',
        type: 'string',
        demandOption: true,
      })
      .option('query', {
        describe: 'Query parameters (JSON)',
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
    const id = args.id as string;
    const { query, headers } = parseSdkParams(args);
    const result = await getExecution(id, query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], executionColumns);
  }
}

class CreateExecutionCommand implements CommandPlugin {
  readonly name = 'create-execution';

  builder(yargs: Argv): Argv {
    return yargs
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"configurationId":"cfg-1"}\'',
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
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    if (args.dryRun) {
      logger.info(`[Dry Run] Would create execution with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await createExecution(body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Execution created successfully.`);
    logger.info(`ID: ${result.data.id}`);
    logger.info(`Status: ${result.data.status}`);
  }
}

class UpdateExecutionCommand implements CommandPlugin {
  readonly name = 'update-execution';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Execution ID',
        type: 'string',
        demandOption: true,
      })
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"targetStatus":"STOPPED"}\'',
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
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const id = args.id as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would update execution ${id} with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await updateExecution(id, body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Execution ${id} updated successfully.`);
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class DeleteExecutionCommand implements CommandPlugin {
  readonly name = 'delete-execution';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Execution ID',
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
    const id = args.id as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would delete execution ${id}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete execution ${id}. Use --force to confirm.`,
      );
      return;
    }

    const { headers } = parseSdkParams(args);
    const result = await deleteExecution(id, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Execution ${id} deleted successfully.`);
  }
}

export default [
  new ListExecutionsCommand(),
  new GetExecutionCommand(),
  new CreateExecutionCommand(),
  new UpdateExecutionCommand(),
  new DeleteExecutionCommand(),
];

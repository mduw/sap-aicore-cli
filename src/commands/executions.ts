import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
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
      .option('status', {
        describe: 'Filter by execution status',
        type: 'string',
      })
      .option('scenario-id', {
        describe: 'Filter by scenario ID',
        type: 'string',
      })
      .option('top', {
        describe: 'Maximum number of results',
        type: 'number',
      })
      .option('skip', {
        describe: 'Number of results to skip',
        type: 'number',
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
    const result = await listExecutions(resourceGroup, {
      status: args.status as string | undefined,
      scenarioId: args.scenarioId as string | undefined,
      top: args.top as number | undefined,
      skip: args.skip as number | undefined,
    });

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
    const resourceGroup = args.resourceGroup as string;
    const result = await getExecution(id, resourceGroup);

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
      .option('config-id', {
        describe: 'Configuration ID for the execution',
        type: 'string',
        demandOption: true,
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
    const configId = args.configId as string;
    const resourceGroup = args.resourceGroup as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would create execution with configuration: ${configId}`);
      return;
    }

    const result = await createExecution(configId, resourceGroup);

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
      .option('target-status', {
        describe: 'Target status (e.g. STOPPED)',
        type: 'string',
        demandOption: true,
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
    const targetStatus = args.targetStatus as string;
    const resourceGroup = args.resourceGroup as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would update execution ${id} to target status: ${targetStatus}`);
      return;
    }

    const result = await updateExecution(id, targetStatus, resourceGroup);

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
    const resourceGroup = args.resourceGroup as string;

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

    const result = await deleteExecution(id, resourceGroup);

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

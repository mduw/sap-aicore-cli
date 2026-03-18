import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  listExecutionSchedules,
  getExecutionSchedule,
  createExecutionSchedule,
  updateExecutionSchedule,
  deleteExecutionSchedule,
} from '../api/execution-schedules.js';

const scheduleColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Configuration', key: 'configurationId', width: 36 },
  { header: 'Cron', key: 'cron', width: 20 },
  { header: 'Status', key: 'status', width: 12 },
];

class ListExecutionSchedulesCommand implements CommandPlugin {
  readonly name = 'list-execution-schedules';

  builder(yargs: Argv): Argv {
    return yargs
      .option('query', {
        describe: 'Query parameters (JSON), e.g. \'{"$top":10}\'',
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
    const result = await listExecutionSchedules(query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const schedules = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(schedules, null, 2));
      return;
    }

    formatTable(schedules, scheduleColumns);
  }
}

class GetExecutionScheduleCommand implements CommandPlugin {
  readonly name = 'get-execution-schedule';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Execution schedule ID',
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
    const { headers } = parseSdkParams(args);
    const result = await getExecutionSchedule(id, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], scheduleColumns);
  }
}

class CreateExecutionScheduleCommand implements CommandPlugin {
  readonly name = 'create-execution-schedule';

  builder(yargs: Argv): Argv {
    return yargs
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"configurationId":"cfg-1","cron":"0 * * * *","name":"my-schedule"}\'',
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
      logger.info(`[Dry Run] Would create execution schedule with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await createExecutionSchedule(body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Execution schedule created successfully.`);
    logger.info(`ID: ${result.data.id}`);
  }
}

class UpdateExecutionScheduleCommand implements CommandPlugin {
  readonly name = 'update-execution-schedule';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Execution schedule ID',
        type: 'string',
        demandOption: true,
      })
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"cron":"0 */2 * * *","status":"ACTIVE"}\'',
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
      logger.info(`[Dry Run] Would update execution schedule ${id} with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await updateExecutionSchedule(id, body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Execution schedule ${id} updated successfully.`);
  }
}

class DeleteExecutionScheduleCommand implements CommandPlugin {
  readonly name = 'delete-execution-schedule';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Execution schedule ID',
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
      logger.info(`[Dry Run] Would delete execution schedule ${id}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete execution schedule ${id}. Use --force to confirm.`,
      );
      return;
    }

    const { headers } = parseSdkParams(args);
    const result = await deleteExecutionSchedule(id, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Execution schedule ${id} deleted successfully.`);
  }
}

export default [
  new ListExecutionSchedulesCommand(),
  new GetExecutionScheduleCommand(),
  new CreateExecutionScheduleCommand(),
  new UpdateExecutionScheduleCommand(),
  new DeleteExecutionScheduleCommand(),
];

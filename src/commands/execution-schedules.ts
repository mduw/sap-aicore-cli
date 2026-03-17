import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
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
    const result = await listExecutionSchedules(resourceGroup, {
      top: args.top as number | undefined,
      skip: args.skip as number | undefined,
    });

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
    const result = await getExecutionSchedule(id, resourceGroup);

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
      .option('config-id', {
        describe: 'Configuration ID',
        type: 'string',
        demandOption: true,
      })
      .option('cron', {
        describe: 'Cron expression for the schedule',
        type: 'string',
        demandOption: true,
      })
      .option('name', {
        describe: 'Schedule name',
        type: 'string',
        demandOption: true,
      })
      .option('start', {
        describe: 'Start time (ISO 8601)',
        type: 'string',
      })
      .option('end', {
        describe: 'End time (ISO 8601)',
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
    const configId = args.configId as string;
    const cron = args.cron as string;
    const name = args.name as string;
    const resourceGroup = args.resourceGroup as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would create execution schedule "${name}" with cron: ${cron}`);
      return;
    }

    const result = await createExecutionSchedule(configId, cron, name, resourceGroup, {
      start: args.start as string | undefined,
      end: args.end as string | undefined,
    });

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
      .option('cron', {
        describe: 'New cron expression',
        type: 'string',
      })
      .option('status', {
        describe: 'New status (ACTIVE or INACTIVE)',
        type: 'string',
        choices: ['ACTIVE', 'INACTIVE'],
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

    if (args.dryRun) {
      logger.info(`[Dry Run] Would update execution schedule ${id}`);
      return;
    }

    const result = await updateExecutionSchedule(id, resourceGroup, {
      cron: args.cron as string | undefined,
      status: args.status as string | undefined,
    });

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

    if (!args.force) {
      logger.warn(
        `Warning: This will delete execution schedule ${id}. Use --force to confirm.`,
      );
      return;
    }

    const result = await deleteExecutionSchedule(id, resourceGroup);

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

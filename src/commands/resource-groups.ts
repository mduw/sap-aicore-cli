import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import {
  listResourceGroups,
  getResourceGroup,
  createResourceGroup,
  updateResourceGroup,
  deleteResourceGroup,
} from '../api/resource-groups.js';

const resourceGroupColumns: Column<any>[] = [
  { header: 'ID', key: 'resourceGroupId', width: 30 },
  { header: 'Status', key: 'status', width: 15 },
  { header: 'Created', key: 'createdAt', width: 20 },
];

class ListResourceGroupsCommand implements CommandPlugin {
  readonly name = 'list-resource-groups';

  builder(yargs: Argv): Argv {
    return yargs
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const result = await listResourceGroups();

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const groups = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(groups, null, 2));
      return;
    }

    formatTable(groups, resourceGroupColumns);
  }
}

class GetResourceGroupCommand implements CommandPlugin {
  readonly name = 'get-resource-group';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Resource group ID',
        type: 'string',
        demandOption: true,
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const id = args.id as string;
    const result = await getResourceGroup(id);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], resourceGroupColumns);
  }
}

class CreateResourceGroupCommand implements CommandPlugin {
  readonly name = 'create-resource-group';

  builder(yargs: Argv): Argv {
    return yargs
      .option('id', {
        describe: 'Resource group ID',
        type: 'string',
        demandOption: true,
      })
      .option('labels', {
        describe: 'Labels as JSON string (array of {key, value} objects)',
        type: 'string',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const body: any = {
      resourceGroupId: args.id as string,
    };

    if (args.labels) {
      try {
        body.labels = JSON.parse(args.labels as string);
      } catch {
        logger.error('Invalid JSON for --labels');
        return;
      }
    }

    const result = await createResourceGroup(body);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success('Resource group created successfully.');
    logger.info(`ID: ${result.data.resourceGroupId ?? args.id}`);
  }
}

class UpdateResourceGroupCommand implements CommandPlugin {
  readonly name = 'update-resource-group';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Resource group ID',
        type: 'string',
        demandOption: true,
      })
      .option('labels', {
        describe: 'Labels as JSON string (array of {key, value} objects)',
        type: 'string',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const id = args.id as string;
    const body: any = {};

    if (args.labels) {
      try {
        body.labels = JSON.parse(args.labels as string);
      } catch {
        logger.error('Invalid JSON for --labels');
        return;
      }
    }

    const result = await updateResourceGroup(id, body);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Resource group ${id} updated successfully.`);
  }
}

class DeleteResourceGroupCommand implements CommandPlugin {
  readonly name = 'delete-resource-group';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Resource group ID',
        type: 'string',
        demandOption: true,
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

    if (!args.force) {
      logger.warn(
        `Warning: This will delete resource group ${id}. Use --force to confirm.`,
      );
      return;
    }

    const result = await deleteResourceGroup(id);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Resource group ${id} deleted successfully.`);
  }
}

export default [
  new ListResourceGroupsCommand(),
  new GetResourceGroupCommand(),
  new CreateResourceGroupCommand(),
  new UpdateResourceGroupCommand(),
  new DeleteResourceGroupCommand(),
];

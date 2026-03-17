import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import {
  listGenericSecrets,
  getGenericSecret,
  createGenericSecret,
  updateGenericSecret,
  deleteGenericSecret,
} from '../api/generic-secrets.js';

const secretColumns: Column<any>[] = [
  { header: 'Name', key: 'name', width: 30 },
  { header: 'Status', key: 'status', width: 15 },
];

class ListSecretsCommand implements CommandPlugin {
  readonly name = 'list-secrets';

  builder(yargs: Argv): Argv {
    return yargs
      .option('resource-group', {
        describe: 'AI resource group',
        type: 'string',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const resourceGroup = args.resourceGroup as string | undefined;
    const result = await listGenericSecrets(resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const secrets = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(secrets, null, 2));
      return;
    }

    formatTable(secrets, secretColumns);
  }
}

class GetSecretCommand implements CommandPlugin {
  readonly name = 'get-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Secret name',
        type: 'string',
        demandOption: true,
      })
      .option('resource-group', {
        describe: 'AI resource group',
        type: 'string',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const name = args.name as string;
    const resourceGroup = args.resourceGroup as string | undefined;
    const result = await getGenericSecret(name, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], secretColumns);
  }
}

class CreateSecretCommand implements CommandPlugin {
  readonly name = 'create-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .option('name', {
        describe: 'Secret name',
        type: 'string',
        demandOption: true,
      })
      .option('data', {
        describe: 'Secret data as JSON string',
        type: 'string',
        demandOption: true,
      })
      .option('resource-group', {
        describe: 'AI resource group',
        type: 'string',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    let data: Record<string, any>;
    try {
      data = JSON.parse(args.data as string);
    } catch {
      logger.error('Invalid JSON for --data');
      return;
    }

    const body = {
      name: args.name as string,
      data,
    };
    const resourceGroup = args.resourceGroup as string | undefined;

    const result = await createGenericSecret(body, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success('Secret created successfully.');
    logger.info(`Name: ${result.data.name ?? args.name}`);
  }
}

class UpdateSecretCommand implements CommandPlugin {
  readonly name = 'update-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Secret name',
        type: 'string',
        demandOption: true,
      })
      .option('data', {
        describe: 'Secret data as JSON string',
        type: 'string',
        demandOption: true,
      })
      .option('resource-group', {
        describe: 'AI resource group',
        type: 'string',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const name = args.name as string;
    let data: Record<string, any>;
    try {
      data = JSON.parse(args.data as string);
    } catch {
      logger.error('Invalid JSON for --data');
      return;
    }

    const resourceGroup = args.resourceGroup as string | undefined;
    const result = await updateGenericSecret(name, { data }, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Secret ${name} updated successfully.`);
  }
}

class DeleteSecretCommand implements CommandPlugin {
  readonly name = 'delete-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Secret name',
        type: 'string',
        demandOption: true,
      })
      .option('resource-group', {
        describe: 'AI resource group',
        type: 'string',
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
    const name = args.name as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would delete secret ${name}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete secret ${name}. Use --force to confirm.`,
      );
      return;
    }

    const resourceGroup = args.resourceGroup as string | undefined;
    const result = await deleteGenericSecret(name, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Secret ${name} deleted successfully.`);
  }
}

export default [
  new ListSecretsCommand(),
  new GetSecretCommand(),
  new CreateSecretCommand(),
  new UpdateSecretCommand(),
  new DeleteSecretCommand(),
];

import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import {
  listObjectStoreSecrets,
  createObjectStoreSecret,
  updateObjectStoreSecret,
  deleteObjectStoreSecret,
} from '../api/object-store-secrets.js';

const objectStoreSecretColumns: Column<any>[] = [
  { header: 'Name', key: 'name', width: 30 },
  { header: 'Type', key: 'type', width: 10 },
  { header: 'Status', key: 'status', width: 15 },
];

class ListObjectStoreSecretsCommand implements CommandPlugin {
  readonly name = 'list-object-store-secrets';

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
    const result = await listObjectStoreSecrets(resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const secrets = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(secrets, null, 2));
      return;
    }

    formatTable(secrets, objectStoreSecretColumns);
  }
}

class CreateObjectStoreSecretCommand implements CommandPlugin {
  readonly name = 'create-object-store-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .option('name', {
        describe: 'Object store secret name',
        type: 'string',
        demandOption: true,
      })
      .option('type', {
        describe: 'Storage type (e.g. S3, GCS)',
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
      type: args.type as string,
      data,
    };
    const resourceGroup = args.resourceGroup as string | undefined;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would create object store secret "${body.name}"`);
      return;
    }

    const result = await createObjectStoreSecret(body, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success('Object store secret created successfully.');
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class UpdateObjectStoreSecretCommand implements CommandPlugin {
  readonly name = 'update-object-store-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Object store secret name',
        type: 'string',
        demandOption: true,
      })
      .option('type', {
        describe: 'Storage type (e.g. S3, GCS)',
        type: 'string',
      })
      .option('data', {
        describe: 'Secret data as JSON string',
        type: 'string',
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
    const body: any = { name };
    if (args.type) body.type = args.type;
    if (args.data) {
      try {
        body.data = JSON.parse(args.data as string);
      } catch {
        logger.error('Invalid JSON for --data');
        return;
      }
    }
    const resourceGroup = args.resourceGroup as string | undefined;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would update object store secret ${name}`);
      return;
    }

    const result = await updateObjectStoreSecret(name, body, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Object store secret ${name} updated successfully.`);
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class DeleteObjectStoreSecretCommand implements CommandPlugin {
  readonly name = 'delete-object-store-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Object store secret name',
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
      logger.info(`[Dry Run] Would delete object store secret ${name}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete object store secret ${name}. Use --force to confirm.`,
      );
      return;
    }

    const resourceGroup = args.resourceGroup as string | undefined;
    const result = await deleteObjectStoreSecret(name, resourceGroup);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Object store secret ${name} deleted successfully.`);
  }
}

export default [
  new ListObjectStoreSecretsCommand(),
  new CreateObjectStoreSecretCommand(),
  new UpdateObjectStoreSecretCommand(),
  new DeleteObjectStoreSecretCommand(),
];

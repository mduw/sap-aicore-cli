import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
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
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const { query, headers } = parseSdkParams(args);
    const hasQuery = Object.keys(query).length > 0;
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await listObjectStoreSecrets(
      hasQuery ? query : undefined,
      hasHeaders ? headers : undefined,
    );

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
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"name":"my-secret","type":"S3","data":{"bucket":"my-bucket"}}\'',
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
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    if (args.dryRun) {
      logger.info(`[Dry Run] Would create object store secret with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await createObjectStoreSecret(
      body,
      hasHeaders ? headers : undefined,
    );

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
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"type":"S3","data":{"bucket":"new-bucket"}}\'',
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
      logger.info(`[Dry Run] Would update object store secret ${name} with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await updateObjectStoreSecret(
      name,
      body,
      hasHeaders ? headers : undefined,
    );

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
      .option('headers', {
        describe: 'Header parameters (JSON)',
        type: 'string',
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

    const { headers } = parseSdkParams(args);
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await deleteObjectStoreSecret(
      name,
      hasHeaders ? headers : undefined,
    );

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

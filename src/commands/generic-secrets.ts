import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
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
    const result = await listGenericSecrets(
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
    const { headers } = parseSdkParams(args);
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await getGenericSecret(name, hasHeaders ? headers : undefined);

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
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"name":"my-secret","data":{"key":"value"}}\'',
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
      logger.info(`[Dry Run] Would create secret with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await createGenericSecret(
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

    logger.success('Secret created successfully.');
    logger.info(`Name: ${result.data.name ?? 'OK'}`);
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
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"data":{"key":"new-value"}}\'',
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
      logger.info(`[Dry Run] Would update secret ${name} with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await updateGenericSecret(
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
      logger.info(`[Dry Run] Would delete secret ${name}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete secret ${name}. Use --force to confirm.`,
      );
      return;
    }

    const { headers } = parseSdkParams(args);
    const hasHeaders = Object.keys(headers).length > 0;
    const result = await deleteGenericSecret(
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

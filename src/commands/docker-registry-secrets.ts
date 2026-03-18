import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  listDockerRegistrySecrets,
  createDockerRegistrySecret,
  updateDockerRegistrySecret,
  deleteDockerRegistrySecret,
} from '../api/docker-registry-secrets.js';

const dockerSecretColumns: Column<any>[] = [
  { header: 'Name', key: 'name', width: 30 },
  { header: 'Status', key: 'status', width: 15 },
];

class ListDockerSecretsCommand implements CommandPlugin {
  readonly name = 'list-docker-secrets';

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
    const result = await listDockerRegistrySecrets(
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

    formatTable(secrets, dockerSecretColumns);
  }
}

class CreateDockerSecretCommand implements CommandPlugin {
  readonly name = 'create-docker-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"name":"my-secret","data":{".dockerconfigjson":"..."}}\'',
        type: 'string',
        demandOption: true,
      })
      .option('headers', {
        describe: 'Header parameters (JSON)',
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
      logger.info(`[Dry Run] Would create docker registry secret with body: ${args.body}`);
      return;
    }

    const { body } = parseSdkParams(args);
    const result = await createDockerRegistrySecret(body as any);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success('Docker registry secret created successfully.');
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class UpdateDockerSecretCommand implements CommandPlugin {
  readonly name = 'update-docker-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Docker registry secret name',
        type: 'string',
        demandOption: true,
      })
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"data":{".dockerconfigjson":"..."}}\'',
        type: 'string',
        demandOption: true,
      })
      .option('headers', {
        describe: 'Header parameters (JSON)',
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
      logger.info(`[Dry Run] Would update docker registry secret ${name} with body: ${args.body}`);
      return;
    }

    const { body } = parseSdkParams(args);
    const result = await updateDockerRegistrySecret(name, body);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Docker registry secret ${name} updated successfully.`);
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class DeleteDockerSecretCommand implements CommandPlugin {
  readonly name = 'delete-docker-secret';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Docker registry secret name',
        type: 'string',
        demandOption: true,
      })
      .option('headers', {
        describe: 'Header parameters (JSON)',
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
      logger.info(`[Dry Run] Would delete docker registry secret ${name}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete docker registry secret ${name}. Use --force to confirm.`,
      );
      return;
    }

    const result = await deleteDockerRegistrySecret(name);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Docker registry secret ${name} deleted successfully.`);
  }
}

export default [
  new ListDockerSecretsCommand(),
  new CreateDockerSecretCommand(),
  new UpdateDockerSecretCommand(),
  new DeleteDockerSecretCommand(),
];

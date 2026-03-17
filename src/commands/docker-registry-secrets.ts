import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
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
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const result = await listDockerRegistrySecrets();

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
      .option('name', {
        describe: 'Docker registry secret name',
        type: 'string',
        demandOption: true,
      })
      .option('server', {
        describe: 'Docker registry server URL',
        type: 'string',
        demandOption: true,
      })
      .option('username', {
        describe: 'Docker registry username',
        type: 'string',
        demandOption: true,
      })
      .option('password', {
        describe: 'Docker registry password',
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
    const result = await createDockerRegistrySecret(
      args.name as string,
      args.server as string,
      args.username as string,
      args.password as string,
    );

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
      .option('server', {
        describe: 'Docker registry server URL',
        type: 'string',
      })
      .option('username', {
        describe: 'Docker registry username',
        type: 'string',
      })
      .option('password', {
        describe: 'Docker registry password',
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
    const server = args.server as string;
    const username = args.username as string;
    const password = args.password as string;

    const result = await updateDockerRegistrySecret(name, server, username, password);

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

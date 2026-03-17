import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import {
  listRepositories,
  getRepository,
  createRepository,
  updateRepository,
  deleteRepository,
} from '../api/repositories.js';

const repositoryColumns: Column<any>[] = [
  { header: 'Name', key: 'name', width: 30 },
  { header: 'URL', key: 'url', width: 50 },
  { header: 'Status', key: 'status', width: 12 },
];

class ListRepositoriesCommand implements CommandPlugin {
  readonly name = 'list-repositories';

  builder(yargs: Argv): Argv {
    return yargs
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const result = await listRepositories();

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const repositories = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(repositories, null, 2));
      return;
    }

    formatTable(repositories, repositoryColumns);
  }
}

class GetRepositoryCommand implements CommandPlugin {
  readonly name = 'get-repository';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Repository name',
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
    const name = args.name as string;
    const result = await getRepository(name);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], repositoryColumns);
  }
}

class CreateRepositoryCommand implements CommandPlugin {
  readonly name = 'create-repository';

  builder(yargs: Argv): Argv {
    return yargs
      .option('name', {
        describe: 'Repository name',
        type: 'string',
        demandOption: true,
      })
      .option('url', {
        describe: 'Repository URL',
        type: 'string',
        demandOption: true,
      })
      .option('username', {
        describe: 'Repository username',
        type: 'string',
        demandOption: true,
      })
      .option('password', {
        describe: 'Repository password',
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
    const body = {
      name: args.name as string,
      url: args.url as string,
      username: args.username as string,
      password: args.password as string,
    };

    const result = await createRepository(body);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success('Repository created successfully.');
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class UpdateRepositoryCommand implements CommandPlugin {
  readonly name = 'update-repository';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Repository name',
        type: 'string',
        demandOption: true,
      })
      .option('url', {
        describe: 'Repository URL',
        type: 'string',
      })
      .option('username', {
        describe: 'Repository username',
        type: 'string',
      })
      .option('password', {
        describe: 'Repository password',
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
    const body: any = {};
    if (args.url) body.url = args.url;
    if (args.username) body.username = args.username;
    if (args.password) body.password = args.password;

    const result = await updateRepository(name, body);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Repository ${name} updated successfully.`);
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class DeleteRepositoryCommand implements CommandPlugin {
  readonly name = 'delete-repository';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Repository name',
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
      logger.info(`[Dry Run] Would delete repository ${name}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete repository ${name}. Use --force to confirm.`,
      );
      return;
    }

    const result = await deleteRepository(name);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Repository ${name} deleted successfully.`);
  }
}

export default [
  new ListRepositoriesCommand(),
  new GetRepositoryCommand(),
  new CreateRepositoryCommand(),
  new UpdateRepositoryCommand(),
  new DeleteRepositoryCommand(),
];

import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../api/applications.js';

const applicationColumns: Column<any>[] = [
  { header: 'Name', key: 'applicationName', width: 30 },
  { header: 'Repository URL', key: 'repositoryUrl', width: 50 },
  { header: 'Revision', key: 'revision', width: 15 },
  { header: 'Path', key: 'path', width: 20 },
  { header: 'Status', key: 'healthStatus', width: 12 },
];

class ListApplicationsCommand implements CommandPlugin {
  readonly name = 'list-applications';

  builder(yargs: Argv): Argv {
    return yargs
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const result = await listApplications();

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const applications = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(applications, null, 2));
      return;
    }

    formatTable(applications, applicationColumns);
  }
}

class GetApplicationCommand implements CommandPlugin {
  readonly name = 'get-application';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Application name',
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
    const result = await getApplication(name);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], applicationColumns);
  }
}

class CreateApplicationCommand implements CommandPlugin {
  readonly name = 'create-application';

  builder(yargs: Argv): Argv {
    return yargs
      .option('name', {
        describe: 'Application name',
        type: 'string',
        demandOption: true,
      })
      .option('repo-name', {
        describe: 'Repository URL',
        type: 'string',
        demandOption: true,
      })
      .option('revision', {
        describe: 'Repository revision',
        type: 'string',
        demandOption: true,
      })
      .option('path', {
        describe: 'Path within the repository',
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
      applicationName: args.name as string,
      repositoryUrl: args.repoName as string,
      revision: args.revision as string,
      path: args.path as string,
    };

    const result = await createApplication(body);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success('Application created successfully.');
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class UpdateApplicationCommand implements CommandPlugin {
  readonly name = 'update-application';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Application name',
        type: 'string',
        demandOption: true,
      })
      .option('repo-name', {
        describe: 'Repository URL',
        type: 'string',
      })
      .option('revision', {
        describe: 'Repository revision',
        type: 'string',
      })
      .option('path', {
        describe: 'Path within the repository',
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
    if (args.repoName) body.repositoryUrl = args.repoName;
    if (args.revision) body.revision = args.revision;
    if (args.path) body.path = args.path;

    const result = await updateApplication(name, body);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Application ${name} updated successfully.`);
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class DeleteApplicationCommand implements CommandPlugin {
  readonly name = 'delete-application';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Application name',
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
      logger.info(`[Dry Run] Would delete application ${name}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete application ${name}. Use --force to confirm.`,
      );
      return;
    }

    const result = await deleteApplication(name);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Application ${name} deleted successfully.`);
  }
}

export default [
  new ListApplicationsCommand(),
  new GetApplicationCommand(),
  new CreateApplicationCommand(),
  new UpdateApplicationCommand(),
  new DeleteApplicationCommand(),
];

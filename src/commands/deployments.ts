import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  listDeployments,
  getDeployment,
  createDeployment,
  updateDeployment,
  deleteDeployment,
} from '../api/deployments.js';

const deploymentColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Configuration', key: 'configurationId', width: 36 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Target', key: 'targetStatus', width: 10 },
  { header: 'Created', key: 'createdAt', width: 20 },
];

class ListDeploymentsCommand implements CommandPlugin {
  readonly name = 'list-deployments';

  builder(yargs: Argv): Argv {
    return yargs
      .option('query', {
        describe: 'Query parameters (JSON), e.g. \'{"status":"RUNNING","$top":10}\'',
        type: 'string',
      })
      .option('headers', {
        describe: 'Header parameters (JSON)',
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
    const { query, headers } = parseSdkParams(args);
    const result = await listDeployments(query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const deployments = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(deployments, null, 2));
      return;
    }

    formatTable(deployments, deploymentColumns);
  }
}

class GetDeploymentCommand implements CommandPlugin {
  readonly name = 'get-deployment';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Deployment ID',
        type: 'string',
        demandOption: true,
      })
      .option('query', {
        describe: 'Query parameters (JSON)',
        type: 'string',
      })
      .option('headers', {
        describe: 'Header parameters (JSON)',
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
    const id = args.id as string;
    const { query, headers } = parseSdkParams(args);
    const result = await getDeployment(id, query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], deploymentColumns);
  }
}

class CreateDeploymentCommand implements CommandPlugin {
  readonly name = 'create-deployment';

  builder(yargs: Argv): Argv {
    return yargs
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"configurationId":"cfg-1"}\'',
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
        default: 'default',
      })
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    if (args.dryRun) {
      logger.info(`[Dry Run] Would create deployment with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await createDeployment(body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Deployment created successfully.`);
    logger.info(`ID: ${result.data.id}`);
    logger.info(`Status: ${result.data.status}`);
  }
}

class UpdateDeploymentCommand implements CommandPlugin {
  readonly name = 'update-deployment';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Deployment ID',
        type: 'string',
        demandOption: true,
      })
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"targetStatus":"STOPPED"}\'',
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

    if (args.dryRun) {
      logger.info(`[Dry Run] Would update deployment ${id} with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await updateDeployment(id, body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Deployment ${id} updated successfully.`);
    logger.info(`Message: ${result.data.message ?? 'OK'}`);
  }
}

class DeleteDeploymentCommand implements CommandPlugin {
  readonly name = 'delete-deployment';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Deployment ID',
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

    if (args.dryRun) {
      logger.info(`[Dry Run] Would delete deployment ${id}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete deployment ${id}. Use --force to confirm.`,
      );
      return;
    }

    const { headers } = parseSdkParams(args);
    const result = await deleteDeployment(id, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Deployment ${id} deleted successfully.`);
  }
}

export default [
  new ListDeploymentsCommand(),
  new GetDeploymentCommand(),
  new CreateDeploymentCommand(),
  new UpdateDeploymentCommand(),
  new DeleteDeploymentCommand(),
];

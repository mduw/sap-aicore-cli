import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  listConfigurations,
  getConfiguration,
  createConfiguration,
} from '../api/configurations.js';

const configurationColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Scenario', key: 'scenarioId', width: 24 },
  { header: 'Executable', key: 'executableId', width: 24 },
  { header: 'Created', key: 'createdAt', width: 20 },
];

class ListConfigurationsCommand implements CommandPlugin {
  readonly name = 'list-configurations';

  builder(yargs: Argv): Argv {
    return yargs
      .option('query', {
        describe: 'Query parameters (JSON), e.g. \'{"scenarioId":"s1","$top":10}\'',
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
    const result = await listConfigurations(query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const configurations = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(configurations, null, 2));
      return;
    }

    formatTable(configurations, configurationColumns);
  }
}

class GetConfigurationCommand implements CommandPlugin {
  readonly name = 'get-configuration';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Configuration ID',
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
    const result = await getConfiguration(id, query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], configurationColumns);
  }
}

class CreateConfigurationCommand implements CommandPlugin {
  readonly name = 'create-configuration';

  builder(yargs: Argv): Argv {
    return yargs
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"name":"my-config","executableId":"exec-1","scenarioId":"s1"}\'',
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
      logger.info(`[Dry Run] Would create configuration with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await createConfiguration(body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Configuration created successfully.`);
    logger.info(`ID: ${result.data.id}`);
  }
}

export default [
  new ListConfigurationsCommand(),
  new GetConfigurationCommand(),
  new CreateConfigurationCommand(),
];

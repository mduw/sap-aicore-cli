import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
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
      .option('scenario-id', {
        describe: 'Filter by scenario ID',
        type: 'string',
      })
      .option('top', {
        describe: 'Maximum number of results',
        type: 'number',
      })
      .option('skip', {
        describe: 'Number of results to skip',
        type: 'number',
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
    const resourceGroup = args.resourceGroup as string;
    const result = await listConfigurations(resourceGroup, {
      scenarioId: args.scenarioId as string | undefined,
      top: args.top as number | undefined,
      skip: args.skip as number | undefined,
    });

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
    const resourceGroup = args.resourceGroup as string;
    const result = await getConfiguration(id, resourceGroup);

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
      .option('name', {
        describe: 'Configuration name',
        type: 'string',
        demandOption: true,
      })
      .option('executable-id', {
        describe: 'Executable ID',
        type: 'string',
        demandOption: true,
      })
      .option('scenario-id', {
        describe: 'Scenario ID',
        type: 'string',
        demandOption: true,
      })
      .option('params', {
        describe: 'Parameter bindings as JSON string (array of {key, value})',
        type: 'string',
      })
      .option('input-artifacts', {
        describe: 'Input artifact bindings as JSON string (array of {key, artifactId})',
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
    const name = args.name as string;
    const executableId = args.executableId as string;
    const scenarioId = args.scenarioId as string;
    const resourceGroup = args.resourceGroup as string;

    let parameterBindings: Array<{ key: string; value: string }> | undefined;
    let inputArtifactBindings: Array<{ key: string; artifactId: string }> | undefined;

    if (args.params) {
      try {
        parameterBindings = JSON.parse(args.params as string);
      } catch {
        logger.error('Invalid JSON for --params');
        return;
      }
    }

    if (args.inputArtifacts) {
      try {
        inputArtifactBindings = JSON.parse(args.inputArtifacts as string);
      } catch {
        logger.error('Invalid JSON for --input-artifacts');
        return;
      }
    }

    if (args.dryRun) {
      logger.info(`[Dry Run] Would create configuration "${name}" for scenario ${scenarioId}`);
      return;
    }

    const result = await createConfiguration(name, executableId, scenarioId, resourceGroup, {
      parameterBindings,
      inputArtifactBindings,
    });

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

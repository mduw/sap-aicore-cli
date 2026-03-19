import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import { getScenario, listScenarioVersions, listModels } from '../api/scenarios.js';
import { listExecutables, getExecutable } from '../api/executables.js';

const scenarioColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Description', key: 'description', width: 40 },
];

const versionColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Scenario', key: 'scenarioId', width: 24 },
  { header: 'Description', key: 'description', width: 40 },
];

const executableColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Scenario', key: 'scenarioId', width: 24 },
  { header: 'Version', key: 'versionId', width: 12 },
];

const modelColumns: Column<any>[] = [
  { header: 'Name', key: 'name', width: 30 },
  { header: 'Version', key: 'version', width: 12 },
  { header: 'Description', key: 'description', width: 40 },
];

class GetScenarioCommand implements CommandPlugin {
  readonly name = 'get-scenario';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Scenario ID',
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
    const { headers } = parseSdkParams(args);
    const result = await getScenario(id, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], scenarioColumns);
  }
}

class ListScenarioVersionsCommand implements CommandPlugin {
  readonly name = 'list-scenario-versions';

  builder(yargs: Argv): Argv {
    return yargs
      .option('scenario-id', {
        describe: 'Scenario ID (path parameter)',
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
    const scenarioId = args.scenarioId as string;
    const { query, headers } = parseSdkParams(args);
    const result = await listScenarioVersions(scenarioId, query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const versions = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(versions, null, 2));
      return;
    }

    formatTable(versions, versionColumns);
  }
}

class ListExecutablesCommand implements CommandPlugin {
  readonly name = 'list-executables';

  builder(yargs: Argv): Argv {
    return yargs
      .option('scenario-id', {
        describe: 'Scenario ID (path parameter)',
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
    const scenarioId = args.scenarioId as string;
    const { query, headers } = parseSdkParams(args);
    const result = await listExecutables(scenarioId, query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const executables = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(executables, null, 2));
      return;
    }

    formatTable(executables, executableColumns);
  }
}

class GetExecutableCommand implements CommandPlugin {
  readonly name = 'get-executable';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Executable ID',
        type: 'string',
        demandOption: true,
      })
      .option('scenario-id', {
        describe: 'Scenario ID (path parameter)',
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
    const scenarioId = args.scenarioId as string;
    const { headers } = parseSdkParams(args);
    const result = await getExecutable(scenarioId, id, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], executableColumns);
  }
}

class ListModelsCommand implements CommandPlugin {
  readonly name = 'list-models';

  builder(yargs: Argv): Argv {
    return yargs
      .option('scenario-id', {
        describe: 'Scenario ID (path parameter)',
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
    const scenarioId = args.scenarioId as string;
    const { headers } = parseSdkParams(args);
    const result = await listModels(scenarioId, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const models = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(models, null, 2));
      return;
    }

    formatTable(models, modelColumns);
  }
}

export default [
  new GetScenarioCommand(),
  new ListScenarioVersionsCommand(),
  new ListExecutablesCommand(),
  new GetExecutableCommand(),
  new ListModelsCommand(),
];

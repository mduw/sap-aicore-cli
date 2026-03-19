import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  listArtifacts,
  getArtifact,
  createArtifact,
} from '../api/artifacts.js';

const artifactColumns: Column<any>[] = [
  { header: 'ID', key: 'id', width: 36 },
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Kind', key: 'kind', width: 12 },
  { header: 'Scenario', key: 'scenarioId', width: 24 },
  { header: 'URL', key: 'url', width: 40 },
];

class ListArtifactsCommand implements CommandPlugin {
  readonly name = 'list-artifacts';

  builder(yargs: Argv): Argv {
    return yargs
      .option('query', {
        describe: 'Query parameters (JSON), e.g. \'{"scenarioId":"s1","kind":"model","$top":10}\'',
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
    const result = await listArtifacts(query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const artifacts = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(artifacts, null, 2));
      return;
    }

    formatTable(artifacts, artifactColumns);
  }
}

class GetArtifactCommand implements CommandPlugin {
  readonly name = 'get-artifact';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('id', {
        describe: 'Artifact ID',
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
    const result = await getArtifact(id, query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], artifactColumns);
  }
}

class CreateArtifactCommand implements CommandPlugin {
  readonly name = 'create-artifact';

  builder(yargs: Argv): Argv {
    return yargs
      .option('body', {
        describe: 'Request body (JSON), e.g. \'{"name":"my-artifact","kind":"model","url":"ai://default/path","scenarioId":"s1"}\'',
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
      logger.info(`[Dry Run] Would create artifact with body: ${args.body}`);
      return;
    }

    const { body, headers } = parseSdkParams(args);
    const result = await createArtifact(body, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`Artifact created successfully.`);
    logger.info(`ID: ${result.data.id}`);
  }
}

export default [
  new ListArtifactsCommand(),
  new GetArtifactCommand(),
  new CreateArtifactCommand(),
];

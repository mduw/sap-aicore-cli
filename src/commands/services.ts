import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import type { Column } from '../utils/table-formatter.js';
import { formatTable } from '../utils/table-formatter.js';
import { logger } from '../utils/logger.js';
import {
  listServices,
  getService,
} from '../api/services.js';

const serviceColumns: Column<any>[] = [
  { header: 'Name', key: 'name', width: 30 },
  { header: 'Description', key: 'description', width: 50 },
  { header: 'URL', key: 'url', width: 40 },
];

class ListServicesCommand implements CommandPlugin {
  readonly name = 'list-services';

  builder(yargs: Argv): Argv {
    return yargs
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const result = await listServices();

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    const services = result.data.resources ?? [];

    if (args.json) {
      logger.info(JSON.stringify(services, null, 2));
      return;
    }

    formatTable(services, serviceColumns);
  }
}

class GetServiceCommand implements CommandPlugin {
  readonly name = 'get-service';

  builder(yargs: Argv): Argv {
    return yargs
      .positional('name', {
        describe: 'Service name',
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
    const result = await getService(name);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    formatTable([result.data], serviceColumns);
  }
}

export default [
  new ListServicesCommand(),
  new GetServiceCommand(),
];

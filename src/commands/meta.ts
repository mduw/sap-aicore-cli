import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import { logger } from '../utils/logger.js';
import { getMeta } from '../api/meta.js';

class GetMetaCommand implements CommandPlugin {
  readonly name = 'get-meta';

  builder(yargs: Argv): Argv {
    return yargs
      .option('json', {
        describe: 'Output as JSON',
        type: 'boolean',
        default: false,
      });
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const result = await getMeta();

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    // Meta capabilities have varied structure, output as JSON
    logger.info(JSON.stringify(result.data, null, 2));
  }
}

export default [
  new GetMetaCommand(),
];

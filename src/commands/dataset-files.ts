import * as fs from 'node:fs';
import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { CommandPlugin } from '../types/command.js';
import { logger } from '../utils/logger.js';
import { parseSdkParams } from '../utils/sdk-params.js';
import {
  uploadDatasetFile,
  getDatasetFile,
  deleteDatasetFile,
} from '../api/dataset-files.js';

class UploadDatasetFileCommand implements CommandPlugin {
  readonly name = 'upload-dataset-file';

  builder(yargs: Argv): Argv {
    return yargs
      .option('remote-path', {
        describe: 'Remote path for the file',
        type: 'string',
        demandOption: true,
      })
      .option('file', {
        describe: 'Local file path to upload',
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
    const remotePath = args.remotePath as string;
    const filePath = args.file as string;

    if (!fs.existsSync(filePath)) {
      logger.error(`File not found: ${filePath}`);
      return;
    }

    if (args.dryRun) {
      logger.info(`[Dry Run] Would upload ${filePath} to ${remotePath}`);
      return;
    }

    const { query, headers } = parseSdkParams(args);
    const fileBuffer = fs.readFileSync(filePath);
    const result = await uploadDatasetFile(remotePath, fileBuffer, query, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`File uploaded successfully to ${remotePath}.`);
  }
}

class GetDatasetFileCommand implements CommandPlugin {
  readonly name = 'get-dataset-file';

  builder(yargs: Argv): Argv {
    return yargs
      .option('remote-path', {
        describe: 'Remote path of the file',
        type: 'string',
        demandOption: true,
      })
      .option('output', {
        describe: 'Local file path to save the downloaded file',
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
    const remotePath = args.remotePath as string;
    const { headers } = parseSdkParams(args);
    const result = await getDatasetFile(remotePath, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.output) {
      fs.writeFileSync(args.output as string, Buffer.from(result.data as any));
      logger.success(`File downloaded to ${args.output}.`);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify({ path: remotePath, size: (result.data as any).length ?? 'unknown' }, null, 2));
      return;
    }

    // Print content to stdout
    process.stdout.write(Buffer.from(result.data as any));
  }
}

class DeleteDatasetFileCommand implements CommandPlugin {
  readonly name = 'delete-dataset-file';

  builder(yargs: Argv): Argv {
    return yargs
      .option('remote-path', {
        describe: 'Remote path of the file to delete',
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
    const remotePath = args.remotePath as string;

    if (args.dryRun) {
      logger.info(`[Dry Run] Would delete dataset file at ${remotePath}`);
      return;
    }

    if (!args.force) {
      logger.warn(
        `Warning: This will delete file at ${remotePath}. Use --force to confirm.`,
      );
      return;
    }

    const { headers } = parseSdkParams(args);
    const result = await deleteDatasetFile(remotePath, headers);

    if (!result.success) {
      logger.error(result.error);
      return;
    }

    if (args.json) {
      logger.info(JSON.stringify(result.data, null, 2));
      return;
    }

    logger.success(`File at ${remotePath} deleted successfully.`);
  }
}

export default [
  new UploadDatasetFileCommand(),
  new GetDatasetFileCommand(),
  new DeleteDatasetFileCommand(),
];

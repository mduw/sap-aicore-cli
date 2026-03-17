/**
 * Create-prompt command plugin
 */

import { resolve, dirname, join, extname } from 'path';
import { access } from 'fs/promises';
import type { Argv, ArgumentsCamelCase } from 'yargs';
import { createPromptTemplate } from '../api/prompt-registry';
import { loadYamlConfig, loadVariableDefinitionYaml, loadMarkdownContent } from '../utils/yaml-loader';
import type { PromptConfig } from '../types/prompt';
import type { CommandPlugin } from '../types/command';
import { logger } from '../utils/logger';
import { CommandNames } from './index';

interface CreatePromptOptions {
  dir: string;
  force: boolean;
  verbose: boolean;
  dryRun: boolean;
}

/**
 * Create-prompt command - uses yargs for parsing and validation
 */
class CreatePromptCommand implements CommandPlugin {
  name = CommandNames.CREATE_PROMPT;

  builder(yargs: Argv): Argv {
    return yargs
      .option('dir', {
        describe: 'Directory containing prompt.yaml',
        type: 'string',
        demandOption: true,
        requiresArg: true
      })
      .option('force', {
        describe: 'Overwrite existing prompt template',
        type: 'boolean',
        default: false
      })
      .option('verbose', {
        describe: 'Show detailed API payload',
        type: 'boolean',
        default: false
      })
      .option('dry-run', {
        describe: 'Preview action without executing',
        type: 'boolean',
        default: false
      })
      .example('$0 create-prompt --dir ./templates/summarization', 'Create prompt from directory')
      .example('$0 create-prompt --dir ./templates/summarization --dry-run', 'Dry run (validate without creating)')
      .example('$0 create-prompt --dir ./templates/summarization --force', 'Force overwrite existing template');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const config: CreatePromptOptions = {
      dir: args.dir as string,
      force: args.force as boolean,
      verbose: args.verbose as boolean,
      dryRun: args.dryRun as boolean
    };

    await this.execute(config);
  }

  private async execute(config: CreatePromptOptions): Promise<void> {
    logger.banner('Creating Prompt Template');

    // 1. Resolve config path
    const configPath = await this.resolveConfigPath(config.dir);
    const baseDir = dirname(configPath);

    logger.info(`📄 Loading config: ${configPath}\n`);
    logger.debug(`Base directory: ${baseDir}`);

    // 2. Load YAML configuration
    const promptConfig = await loadYamlConfig(configPath);
    logger.debug(`Loaded config: ${JSON.stringify(promptConfig, null, 2)}`);

    // 3. Resolve all content files
    logger.info('📝 Resolving markdown content files...');
    const resolvedConfig = await this.resolveAllContent(promptConfig, baseDir);

    // 4. Validate configuration
    logger.info('✓ Validating configuration...\n');
    this.validatePromptConfig(resolvedConfig);

    if (config.verbose) {
      logger.info('📋 Resolved configuration:');
      logger.info(JSON.stringify(resolvedConfig, null, 2));
      logger.info('');
    }

    if (config.dryRun) {
      logger.info('✅ Dry run: Validation passed!');
      logger.info(`Would create: ${resolvedConfig.name} v${resolvedConfig.version}`);
      logger.info(`Scenario: ${resolvedConfig.scenario}`);
      return;
    }

    // 5. Create prompt template via API
    logger.info(`🚀 Creating prompt template...`);
    await createPromptTemplate(resolvedConfig, { force: config.force, verbose: config.verbose });

    logger.info(`\n✅ Successfully created: ${resolvedConfig.name} v${resolvedConfig.version}`);
    logger.info(`   Scenario: ${resolvedConfig.scenario}`);
  }

  private async resolveConfigPath(dir: string): Promise<string> {
    const resolvedDir = resolve(dir);

    // Try prompt.yaml first, then prompt.yml
    for (const filename of ['prompt.yaml', 'prompt.yml']) {
      const path = join(resolvedDir, filename);
      try {
        await access(path);
        return path;
      } catch {
        // File doesn't exist, try next
      }
    }

    throw new Error(`No prompt.yaml or prompt.yml found in directory: ${resolvedDir}`);
  }

  private async resolveAllContent(config: PromptConfig, baseDir: string): Promise<PromptConfig> {
    const resolved = { ...config };

    // Resolve template content files
    resolved.spec.template = await Promise.all(
      config.spec.template.map(async (entry) => {
        if (entry.contentFile) {
          const filePath = resolve(baseDir, entry.contentFile);
          const ext = extname(filePath);
          logger.info(`  - Loading ${entry.role}: ${entry.contentFile}`);
          logger.debug(`    Full path: ${filePath}`);

          if (ext !== '.md' && ext !== '.txt') {
            logger.info(`    ⚠️  Warning: Expected .md or .txt file, got ${ext}`);
          }

          const content = await loadMarkdownContent(filePath);
          logger.debug(`    Content length: ${content.length} characters`);
          return { role: entry.role, content };
        }
        return entry;
      })
    );

    // Resolve variable_definition reference
    if (typeof config.spec.variable_definition === 'object' && '$ref' in config.spec.variable_definition) {
      const refPath = resolve(baseDir, config.spec.variable_definition.$ref);
      logger.info(`  - Loading variable_definition: ${config.spec.variable_definition.$ref}`);
      logger.debug(`    Full path: ${refPath}`);
      resolved.spec.variable_definition = await loadVariableDefinitionYaml(refPath);
    }

    return resolved;
  }

  private validatePromptConfig(config: PromptConfig): void {
    // Validate required fields
    if (!config.name || !config.version || !config.scenario) {
      throw new Error('Missing required fields: name, version, or scenario');
    }

    // Validate template
    if (!config.spec.template || config.spec.template.length === 0) {
      throw new Error('Template must have at least one entry');
    }

    // Validate all entries have content
    for (const entry of config.spec.template) {
      if (!entry.content) {
        throw new Error(`Template entry with role "${entry.role}" is missing content`);
      }
    }

    // Validate additional fields
    if (!config.spec.additional_fields?.executableId || !config.spec.additional_fields?.llmName) {
      throw new Error('Missing required additional_fields: executableId or llmName');
    }

    logger.info(`✓ Name: ${config.name}`);
    logger.info(`✓ Version: ${config.version}`);
    logger.info(`✓ Scenario: ${config.scenario}`);
    logger.info(`✓ Template entries: ${config.spec.template.length}`);
    logger.info(`✓ Executable: ${config.spec.additional_fields.executableId}`);
    logger.info(`✓ LLM: ${config.spec.additional_fields.llmName}`);
  }
}

export default new CreatePromptCommand();

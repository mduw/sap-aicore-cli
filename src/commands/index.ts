/**
 * Command registry - Plugin system for CLI commands
 * Uses lazy loading for faster startup
 */

import type { CommandPlugin } from '../types/command';

/**
 * Command metadata for lazy loading
 */
interface CommandMetadata {
  name: string;
  description: string;
  usage?: string;
  loader: () => Promise<{ default: CommandPlugin }>;
}

/**
 * Command names enum for type safety
 */
export const CommandNames = {
  INSTALL: 'install',
  UNINSTALL: 'uninstall',
  SETUP: 'setup',
  LIST_SCENARIOS: 'list-scenarios',
  LIST_TEMPLATES: 'list-templates',
  DELETE: 'delete',
  CREATE_PROMPT: 'create-prompt',
  GENERATE_TEMPLATE: 'generate-template',
} as const;

export type CommandName = typeof CommandNames[keyof typeof CommandNames];

/**
 * Registry of command metadata (lightweight, no actual imports)
 */
const commandRegistry: CommandMetadata[] = [
  {
    name: CommandNames.INSTALL,
    description: 'Build and install CLI globally (for local development)',
    loader: () => import('./install')
  },
  {
    name: CommandNames.UNINSTALL,
    description: 'Remove CLI from global installation',
    loader: () => import('./uninstall')
  },
  {
    name: CommandNames.SETUP,
    description: 'Interactive setup wizard for AI Core configuration',
    loader: () => import('./setup')
  },
  {
    name: CommandNames.LIST_SCENARIOS,
    description: 'List all available scenarios in the registry',
    loader: () => import('./list-scenarios')
  },
  {
    name: CommandNames.LIST_TEMPLATES,
    description: 'List prompt templates (all or by scenario)',
    loader: () => import('./list-templates')
  },
  {
    name: CommandNames.DELETE,
    description: 'Delete prompt templates (by scenario or specific template)',
    loader: () => import('./delete')
  },
  {
    name: CommandNames.CREATE_PROMPT,
    description: 'Create a new prompt template from YAML config',
    loader: () => import('./create-prompt')
  },
  {
    name: CommandNames.GENERATE_TEMPLATE,
    description: 'Generate a prompt template from OpenAPI spec',
    loader: () => import('./generate-template')
  }
];

interface EntityModuleDefinition {
  commands: Array<{ name: string; description: string; usage?: string }>;
  loader: () => Promise<{ default: CommandPlugin[] }>;
}

const entityModules: EntityModuleDefinition[] = [
  {
    commands: [
      { name: 'list-deployments', description: 'List deployments' },
      { name: 'get-deployment', description: 'Get deployment details', usage: 'get-deployment <id>' },
      { name: 'create-deployment', description: 'Create a new deployment' },
      { name: 'update-deployment', description: 'Update a deployment (e.g. stop/start)', usage: 'update-deployment <id>' },
      { name: 'delete-deployment', description: 'Delete a deployment', usage: 'delete-deployment <id>' },
    ],
    loader: () => import('./deployments'),
  },
  {
    commands: [
      { name: 'list-executions', description: 'List executions' },
      { name: 'get-execution', description: 'Get execution details', usage: 'get-execution <id>' },
      { name: 'create-execution', description: 'Create a new execution' },
      { name: 'update-execution', description: 'Update an execution', usage: 'update-execution <id>' },
      { name: 'delete-execution', description: 'Delete an execution', usage: 'delete-execution <id>' },
    ],
    loader: () => import('./executions'),
  },
  {
    commands: [
      { name: 'list-configurations', description: 'List configurations' },
      { name: 'get-configuration', description: 'Get configuration details', usage: 'get-configuration <id>' },
      { name: 'create-configuration', description: 'Create a new configuration' },
    ],
    loader: () => import('./configurations'),
  },
  {
    commands: [
      { name: 'get-scenario', description: 'Get scenario details', usage: 'get-scenario <id>' },
      { name: 'list-scenario-versions', description: 'List versions of a scenario' },
      { name: 'list-executables', description: 'List executables for a scenario' },
      { name: 'get-executable', description: 'Get executable details', usage: 'get-executable <id>' },
      { name: 'list-models', description: 'List models for a scenario' },
    ],
    loader: () => import('./scenarios-extended'),
  },
  {
    commands: [
      { name: 'list-artifacts', description: 'List artifacts' },
      { name: 'get-artifact', description: 'Get artifact details', usage: 'get-artifact <id>' },
      { name: 'create-artifact', description: 'Create a new artifact' },
    ],
    loader: () => import('./artifacts'),
  },
  {
    commands: [
      { name: 'list-execution-schedules', description: 'List execution schedules' },
      { name: 'get-execution-schedule', description: 'Get execution schedule details', usage: 'get-execution-schedule <id>' },
      { name: 'create-execution-schedule', description: 'Create a new execution schedule' },
      { name: 'update-execution-schedule', description: 'Update an execution schedule', usage: 'update-execution-schedule <id>' },
      { name: 'delete-execution-schedule', description: 'Delete an execution schedule', usage: 'delete-execution-schedule <id>' },
    ],
    loader: () => import('./execution-schedules'),
  },
];

function registerEntityModules(): void {
  for (const mod of entityModules) {
    for (const cmd of mod.commands) {
      commandRegistry.push({
        name: cmd.name,
        description: cmd.description,
        usage: cmd.usage,
        loader: async () => {
          const module = await mod.loader();
          const plugin = module.default.find((c: CommandPlugin) => c.name === cmd.name);
          if (!plugin) {
            throw new Error(`Command "${cmd.name}" not found in entity module`);
          }
          return { default: plugin };
        },
      });
    }
  }
}

registerEntityModules();

/**
 * Get all command names (fast, no loading)
 */
export function getCommandNames(): string[] {
  return commandRegistry.map(cmd => cmd.name);
}

/**
 * Get all command metadata (fast, for help display)
 */
export function getCommandMetadata(): Array<{ name: string; description: string; usage?: string }> {
  return commandRegistry.map(({ name, description, usage }) => ({ name, description, usage }));
}

/**
 * Get command plugin by name (lazy loads on demand)
 */
export async function getCommand(name: string): Promise<CommandPlugin | undefined> {
  const metadata = commandRegistry.find(cmd => cmd.name === name);
  if (!metadata) {
    return undefined;
  }

  const module = await metadata.loader();
  return module.default;
}

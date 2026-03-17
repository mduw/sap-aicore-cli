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

/**
 * Get all command names (fast, no loading)
 */
export function getCommandNames(): string[] {
  return commandRegistry.map(cmd => cmd.name);
}

/**
 * Get all command metadata (fast, for help display)
 */
export function getCommandMetadata(): Array<{ name: string; description: string }> {
  return commandRegistry.map(({ name, description }) => ({ name, description }));
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

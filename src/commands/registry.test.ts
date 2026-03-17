import { describe, it, expect } from 'vitest';
import { getCommandNames, getCommand, getCommandMetadata } from './index.js';

describe('command registry', () => {
  const allExpectedCommands = [
    // Existing
    'install', 'uninstall', 'setup', 'list-scenarios', 'list-templates',
    'delete', 'create-prompt', 'generate-template',
    // Deployments
    'list-deployments', 'get-deployment', 'create-deployment', 'update-deployment', 'delete-deployment',
    // Executions
    'list-executions', 'get-execution', 'create-execution', 'update-execution', 'delete-execution',
    // Configurations
    'list-configurations', 'get-configuration', 'create-configuration',
    // Scenarios/Executables/Models
    'get-scenario', 'list-scenario-versions', 'list-executables', 'get-executable', 'list-models',
    // Artifacts
    'list-artifacts', 'get-artifact', 'create-artifact',
    // Execution Schedules
    'list-execution-schedules', 'get-execution-schedule', 'create-execution-schedule',
    'update-execution-schedule', 'delete-execution-schedule',
    // Metrics
    'list-metrics', 'delete-metrics',
    // Meta
    'get-meta',
    // Dataset Files
    'upload-dataset-file', 'get-dataset-file', 'delete-dataset-file',
    // Repositories
    'list-repositories', 'get-repository', 'create-repository', 'update-repository', 'delete-repository',
    // Applications
    'list-applications', 'get-application', 'create-application', 'update-application', 'delete-application',
    // Docker Registry Secrets
    'list-docker-secrets', 'create-docker-secret', 'update-docker-secret', 'delete-docker-secret',
    // Object Store Secrets
    'list-object-store-secrets', 'create-object-store-secret', 'update-object-store-secret', 'delete-object-store-secret',
    // Generic Secrets
    'list-secrets', 'get-secret', 'create-secret', 'update-secret', 'delete-secret',
    // Resource Groups
    'list-resource-groups', 'get-resource-group', 'create-resource-group', 'update-resource-group', 'delete-resource-group',
    // Services
    'list-services', 'get-service',
  ];

  it('registers all 70 commands (8 existing + 62 new)', () => {
    const names = getCommandNames();
    expect(names.length).toBe(70);
  });

  it('includes every expected command', () => {
    const names = getCommandNames();
    for (const expected of allExpectedCommands) {
      expect(names, `Missing command: ${expected}`).toContain(expected);
    }
  });

  it('provides usage strings for commands with positional args', () => {
    const metadata = getCommandMetadata();
    const positionalCommands = [
      'get-deployment', 'update-deployment', 'delete-deployment',
      'get-execution', 'update-execution', 'delete-execution',
      'get-configuration', 'get-scenario', 'get-executable', 'get-artifact',
      'get-execution-schedule', 'update-execution-schedule', 'delete-execution-schedule',
      'get-repository', 'update-repository', 'delete-repository',
      'get-application', 'update-application', 'delete-application',
      'update-docker-secret', 'delete-docker-secret',
      'update-object-store-secret', 'delete-object-store-secret',
      'get-secret', 'update-secret', 'delete-secret',
      'get-resource-group', 'update-resource-group', 'delete-resource-group',
      'get-service',
    ];

    for (const cmdName of positionalCommands) {
      const cmd = metadata.find(m => m.name === cmdName);
      expect(cmd, `Command not found: ${cmdName}`).toBeDefined();
      expect(cmd!.usage, `Command ${cmdName} missing usage string`).toBeDefined();
      expect(cmd!.usage, `Command ${cmdName} usage should contain < for positional`).toContain('<');
    }
  });

  it('loads a command plugin by name', async () => {
    const cmd = await getCommand('list-deployments');
    expect(cmd).toBeDefined();
    expect(cmd!.name).toBe('list-deployments');
    expect(cmd!.builder).toBeDefined();
    expect(cmd!.run).toBeDefined();
  });

  it('loads an existing command by name', async () => {
    const cmd = await getCommand('list-scenarios');
    expect(cmd).toBeDefined();
    expect(cmd!.name).toBe('list-scenarios');
  });

  it('returns undefined for unknown command', async () => {
    const cmd = await getCommand('nonexistent-command');
    expect(cmd).toBeUndefined();
  });
});

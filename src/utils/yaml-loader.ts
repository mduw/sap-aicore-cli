/**
 * YAML and Markdown file loading utilities
 */

import { readFile } from 'fs/promises';
import { parse as parseYaml } from 'yaml';
import type { PromptConfig, VariableDefinition } from '../types/prompt';

/**
 * Load and parse YAML configuration file
 */
export async function loadYamlConfig(filePath: string): Promise<PromptConfig> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const config = parseYaml(content) as PromptConfig;

    if (!config) {
      throw new Error('Invalid YAML: empty or malformed file');
    }

    return config;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Config file not found: ${filePath}`);
    }
    if (error.name === 'YAMLParseError') {
      throw new Error(`Failed to parse YAML: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load variable definitions from YAML file
 */
export async function loadVariableDefinitionYaml(filePath: string): Promise<VariableDefinition> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const variableDefinition = parseYaml(content) as VariableDefinition;
    return variableDefinition || {};
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Variable definition file not found: ${filePath}`);
    }
    throw new Error(`Failed to load variable definition from ${filePath}: ${error.message}`);
  }
}

/**
 * Load markdown content file
 */
export async function loadMarkdownContent(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Markdown file not found: ${filePath}`);
    }
    throw new Error(`Failed to read markdown file: ${error.message}`);
  }
}

/**
 * Prompt template configuration types
 */

/**
 * Main prompt template configuration (matches YAML structure)
 */
export interface PromptConfig {
  name: string;
  version: string;
  scenario: string;
  spec: PromptSpec;
  metadata?: PromptMetadata;
}

/**
 * Prompt specification
 */
export interface PromptSpec {
  template: PromptTemplateEntry[];
  variable_definition: VariableDefinition | VariableDefinitionReference;
  additional_fields: AdditionalFields;
}

/**
 * Template entry (system, user, or assistant role)
 */
export interface PromptTemplateEntry {
  role: 'system' | 'user' | 'assistant';
  content?: string;           // Inline content
  contentFile?: string;       // Markdown file reference
}

/**
 * Variable definitions for template variables
 */
export interface VariableDefinition {
  [key: string]: any;
}

/**
 * Reference to external variable definition file
 */
export interface VariableDefinitionReference {
  $ref: string;
}

/**
 * Additional configuration fields
 */
export interface AdditionalFields {
  executableId: string;
  llmName: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

/**
 * Optional metadata for documentation
 */
export interface PromptMetadata {
  description?: string;
  author?: string;
  tags?: string[];
  created?: string;
  updated?: string;
}

/**
 * Options for create-prompt command
 */
export interface CreatePromptOptions {
  dir?: string;               // Template directory
  config?: string;            // Direct YAML path
  name?: string;              // Override name
  version?: string;           // Override version
  scenario?: string;          // Override scenario
  dryRun: boolean;
  force: boolean;
  verbose: boolean;
}

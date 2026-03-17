/**
 * SAP AI Core CLI Helper
 *
 * Library exports for programmatic usage
 * Manages SAP AI Core resources including prompts, scenarios, and configurations
 */

// Re-export SAP AI SDK
export { PromptTemplatesApi } from '@sap-ai-sdk/prompt-registry';

// Re-export main functionality
export {
  fetchTemplates,
  deleteTemplate,
  deleteScenarioTemplates
} from './api/prompt-registry';

export { displayBanner, displaySummary } from './display';

// Re-export all types
export type * from './types';

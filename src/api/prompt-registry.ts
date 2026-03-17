/**
 * Template operations module
 * Handles all prompt template CRUD operations
 */

import { PromptTemplatesApi } from '@sap-ai-sdk/prompt-registry';
import type {
  DeleteResult,
  DeleteScenarioResult,
  FetchScenariosResult,
  FetchTemplatesResult,
  ScenarioInfo,
  ScenarioResults,
  Template,
  TemplateOperationOptions
} from '../types/template';
import { logger } from '../utils/logger';

/**
 * Fetch prompt templates (optionally filtered by scenario)
 */
export async function fetchTemplates(
  scenarioId: string | undefined,
  _options: TemplateOperationOptions
): Promise<FetchTemplatesResult> {
  try {
    const params = scenarioId ? { scenario: scenarioId } : {};
    const response = await PromptTemplatesApi.listPromptTemplates(params).execute();

    if (!response || response.count === 0) {
      return { success: true, data: [] };
    }

    return { success: true, data: (response.resources || []) as Template[] };

  } catch (error: unknown) {
    const err = error as Error;

    // Provide helpful error message for missing service binding
    if (err.message?.includes('Could not find service credentials') ||
        err.message?.includes('service binding')) {
      return {
        success: false,
        error: new Error('AI Core service binding required. Please login to CF and bind the service.')
      };
    }

    return {
      success: false,
      error: err
    };
  }
}

/**
 * Fetch all available scenarios by grouping templates
 */
export async function fetchAllScenarios(
  _options: TemplateOperationOptions
): Promise<FetchScenariosResult> {
  try {
    // Fetch all templates
    const response = await PromptTemplatesApi.listPromptTemplates().execute();

    if (!response || response.count === 0) {
      return { success: true, data: [] };
    }

    const templates = (response.resources || []) as Template[];

    // Group templates by scenario and count them
    const scenarioMap = new Map<string, number>();

    templates.forEach((template: any) => {
      if (template.scenario) {
        const count = scenarioMap.get(template.scenario) || 0;
        scenarioMap.set(template.scenario, count + 1);
      }
    });

    // Convert to array of ScenarioInfo
    const scenarios: ScenarioInfo[] = Array.from(scenarioMap.entries()).map(([id, count]) => ({
      id,
      templateCount: count
    }));

    // Sort by scenario ID
    scenarios.sort((a, b) => a.id.localeCompare(b.id));

    return { success: true, data: scenarios };

  } catch (error: unknown) {
    const err = error as Error;

    // Provide helpful error message for missing service binding
    if (err.message?.includes('Could not find service credentials') ||
        err.message?.includes('service binding')) {
      return {
        success: false,
        error: new Error('AI Core service binding required. Please login to CF and bind the service.')
      };
    }

    return {
      success: false,
      error: err
    };
  }
}

/**
 * Delete a single prompt template by ID
 */
export async function deleteTemplate(
  template: Template,
  options: TemplateOperationOptions
): Promise<DeleteResult> {
  try {
    if (options.dryRun) {
      logger.info(`[DRY RUN] Would delete: ${template.name} (v${template.version}) - ID: ${template.id}`);
      return {
        success: true,
        data: {
          templateId: template.id,
          templateName: template.name,
          dryRun: true
        }
      };
    }

    if (options.verbose) {
      logger.info(`🗑️ Deleting: ${template.name} (v${template.version}) - ID: ${template.id}`);
    }

    logger.debug(`Calling API to delete template ID: ${template.id}`);
    await PromptTemplatesApi.deletePromptTemplate(template.id).execute();

    if (options.verbose) {
      logger.info(`✅ Deleted successfully`);
    }

    return {
      success: true,
      data: {
        templateId: template.id,
        templateName: template.name,
        dryRun: false
      }
    };

  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Failed to delete ${template.name}: ${err.message}`);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Delete a specific template by name and version
 */
export async function deleteSpecificTemplate(
  name: string,
  version: string,
  options: TemplateOperationOptions
): Promise<DeleteScenarioResult> {
  logger.separator();
  logger.info(`Deleting Template: ${name} v${version}`);
  logger.separator();

  try {
    logger.debug(`Fetching all templates to find: ${name} v${version}`);
    // Fetch all templates to find the matching one
    const fetchResult = await fetchTemplates(undefined, options);

    if (!fetchResult.success) {
      return {
        success: false,
        error: fetchResult.error
      };
    }

    // Find the template with matching name and version
    const template = fetchResult.data.find(
      t => t.name === name && t.version === version
    );

    if (!template) {
      logger.error(`Template not found: ${name} v${version}`);
      return {
        success: true,
        data: { deleted: 0, failed: 0, skipped: 0 }
      };
    }

    logger.debug(`Found template with ID: ${template.id}`);

    // Delete the template
    const result = await deleteTemplate(template, options);

    if (result.success) {
      return {
        success: true,
        data: {
          deleted: result.data.dryRun ? 0 : 1,
          failed: 0,
          skipped: result.data.dryRun ? 1 : 0
        }
      };
    } else {
      return {
        success: true,
        data: { deleted: 0, failed: 1, skipped: 0 }
      };
    }

  } catch (error: unknown) {
    const err = error as Error;
    return {
      success: false,
      error: err
    };
  }
}

/**
 * Delete all templates for a specific scenario
 */
export async function deleteScenarioTemplates(
  scenarioId: string,
  options: TemplateOperationOptions
): Promise<DeleteScenarioResult> {
  logger.separator();
  logger.info(`Processing Scenario: ${scenarioId}`);
  logger.separator();

  logger.debug(`Fetching templates for scenario: ${scenarioId}`);
  const fetchResult = await fetchTemplates(scenarioId, options);

  // Handle fetch error
  if (!fetchResult.success) {
    return {
      success: false,
      error: fetchResult.error
    };
  }

  const templates = fetchResult.data;

  if (templates.length === 0) {
    logger.info('✓ No templates to delete');
    return {
      success: true,
      data: { deleted: 0, failed: 0, skipped: 0 }
    };
  }

  logger.debug(`Found ${templates.length} templates to process`);

  const results: ScenarioResults = {
    deleted: 0,
    failed: 0,
    skipped: 0
  };

  // Delete each template
  for (const template of templates) {
    const result = await deleteTemplate(template, options);

    if (result.success) {
      if (result.data.dryRun) {
        results.skipped++;
      } else {
        results.deleted++;
      }
    } else {
      results.failed++;
    }
  }

  return {
    success: true,
    data: results
  };
}

/**
 * Create a new prompt template
 */
export async function createPromptTemplate(
  config: any,
  options: { force: boolean; verbose: boolean }
): Promise<void> {
  try {
    const { variable_definition, ...specWithoutVariables } = config.spec;

    const payload = {
      name: config.name,
      version: config.version,
      scenario: config.scenario,
      spec: specWithoutVariables
    };

    if (options.verbose) {
      logger.info('\n📦 API Payload:');
      logger.info(JSON.stringify(payload, null, 2));
      logger.info('');
    }

    // Call SAP AI SDK to create/update prompt template
    await PromptTemplatesApi.createUpdatePromptTemplate(payload).execute();

  } catch (error: any) {
    // Handle errors
    if (error.response?.status === 409 || error.message?.includes('already exists')) {
      if (!options.force) {
        logger.error(
          `Prompt "${config.name}" v${config.version} already exists. Use --force to overwrite.`
        );
      }
      // If force flag is set, the API should handle the update
      logger.error(`Failed to overwrite template: ${error.message}`);
    } else {
      logger.error(`Unexpected error: `, error);
    }
    throw error;
  }
}

// Re-export types for convenience
export type {
  DeleteResult,
  DeleteResultData, DeleteScenarioResult, FetchScenariosResult, FetchTemplatesResult, ScenarioInfo, ScenarioResults, Template, TemplateOperationOptions
} from '../types/template';


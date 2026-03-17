/**
 * Template operation types
 */

import type { Response } from './common';

export interface Template {
  id: string;
  name: string;
  version: string;
}

/**
 * Result of a template deletion operation
 */
export interface DeleteResultData {
  templateId: string;
  templateName: string;
  dryRun: boolean;
}

/**
 * Standard response for delete operations
 */
export type DeleteResult = Response<DeleteResultData, string>;

/**
 * Results of scenario-wide template operations
 */
export interface ScenarioResults {
  deleted: number;
  failed: number;
  skipped: number;
}

/**
 * Response for fetching templates
 */
export type FetchTemplatesResult = Response<Template[], Error>;

/**
 * Response for scenario deletion operations
 */
export type DeleteScenarioResult = Response<ScenarioResults, Error>;

export interface TemplateOperationOptions {
  dryRun: boolean;
  verbose: boolean;
}

/**
 * Scenario information with template count
 */
export interface ScenarioInfo {
  id: string;
  templateCount: number;
}

/**
 * Response for fetching scenarios
 */
export type FetchScenariosResult = Response<ScenarioInfo[], Error>;

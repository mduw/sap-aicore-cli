/**
 * Display and formatting types
 */

export interface ResultSummary {
  scenarioId: string;
  results: {
    deleted: number;
    failed: number;
    skipped: number;
  };
}

export interface DisplayOptions {
  dryRun: boolean;
}

export interface BannerConfig {
  mode: string;
  verbose: boolean;
  scenarios: string[];
}

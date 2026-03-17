/**
 * Display and formatting utilities
 */

import type { BannerConfig, DisplayOptions, ResultSummary } from './types/display';
import { logger } from './utils/logger';

/**
 * Display summary statistics
 */
export function displaySummary(allResults: ResultSummary[], options: DisplayOptions): void {
  logger.raw('\n');
  logger.raw('─'.repeat(40));

  const totals = allResults.reduce((acc, { results }) => {
    acc.deleted += results.deleted;
    acc.failed += results.failed;
    acc.skipped += results.skipped;
    return acc;
  }, { deleted: 0, failed: 0, skipped: 0 });

  if (options.dryRun) {
    logger.raw(`\n🔍 DRY RUN MODE - No changes were made`);
    logger.raw(`Templates that would be deleted: ${totals.skipped}`);
    if (totals.failed > 0) {
      logger.raw(`Failed operations: ${totals.failed}`);
    }
  } else {
    logger.raw(`\n✅ Successfully deleted: ${totals.deleted}`);
    if (totals.failed > 0) {
      logger.raw(`❌ Failed deletions: ${totals.failed}`);
    }
  }

  logger.raw('\nPer-scenario breakdown:');
  allResults.forEach((item) => {
    const status = item.results.deleted > 0 || item.results.skipped > 0 ? '✓' : '○';
    const count = options.dryRun ? item.results.skipped : item.results.deleted;
    logger.raw(`  ${status} ${item.scenarioId}: ${count} template(s)`);
  });

  logger.raw('─'.repeat(40));
}

/**
 * Display configuration banner
 */
export function displayBanner(config: BannerConfig): void {
  logger.raw('╔═══════════════════════════════════════════════════════════╗');
  logger.raw('║              SAP AI Core CLI (saic-cli)                   ║');
  logger.raw('╚═══════════════════════════════════════════════════════════╝');

  logger.raw('\nConfiguration:');
  logger.raw(`Mode: ${config.mode}`);
  logger.raw(`Verbose: ${config.verbose ? 'enabled' : 'disabled'}`);
  logger.raw(`Scenarios: ${config.scenarios.join(', ')}`);
}

// Re-export types for convenience
export type { BannerConfig, DisplayOptions, ResultSummary } from './types/display';


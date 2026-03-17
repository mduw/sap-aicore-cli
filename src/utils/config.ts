/**
 * Global configuration management
 * Stores AI Core service binding with proper hierarchy and XDG support
 *
 * Priority order (highest to lowest):
 * 1. Environment variables (AICORE_*)
 * 2. Project config (.saic-clirc.json or .saic-cli/config.json)
 * 3. User config (~/.config/saic-cli/config.json or ~/.saic-cli/config.json)
 * 4. System config (/etc/saic-cli/config.json)
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { homedir, platform } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

// XDG Base Directory support (Linux standard)
const XDG_CONFIG_HOME = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
const isLinux = platform() === 'linux';

// Config directories (priority order)
const USER_CONFIG_DIR = isLinux ? join(XDG_CONFIG_HOME, 'saic-cli') : join(homedir(), '.saic-cli');
const USER_CONFIG_FILE = join(USER_CONFIG_DIR, 'config.json');

// Legacy support
const LEGACY_CONFIG_FILE = join(homedir(), '.saic-cli', 'config.json');

const PROJECT_CONFIG_FILES = [
  '.saic-clirc.json',
  '.saic-cli/config.json'
];

const SYSTEM_CONFIG_FILE = '/etc/saic-cli/config.json';

export interface AICoreCredentials {
  clientid: string;
  clientsecret: string;
  url: string;
  serviceurls: {
    AI_API_URL: string;
  };
}

export interface GlobalConfig {
  aicore?: AICoreCredentials;
}

/**
 * Get the user config file path (respects XDG on Linux)
 */
export function getConfigPath(): string {
  return USER_CONFIG_FILE;
}

/**
 * Check if any config exists
 */
export function hasAnyConfig(): boolean {
  return hasEnvironmentConfig() || hasProjectConfig() || hasUserConfig() || hasSystemConfig();
}

/**
 * Check if environment variables are set
 */
export function hasEnvironmentConfig(): boolean {
  return !!(
    process.env.AICORE_CLIENT_ID &&
    process.env.AICORE_CLIENT_SECRET &&
    process.env.AICORE_SERVICE_URL
  );
}

/**
 * Check if project config exists
 */
export function hasProjectConfig(): boolean {
  return PROJECT_CONFIG_FILES.some(file => existsSync(file));
}

/**
 * Check if user config exists
 */
export function hasUserConfig(): boolean {
  return existsSync(USER_CONFIG_FILE) || existsSync(LEGACY_CONFIG_FILE);
}

/**
 * Check if system config exists
 */
export function hasSystemConfig(): boolean {
  return existsSync(SYSTEM_CONFIG_FILE);
}

/**
 * Load credentials from environment variables
 */
export function loadEnvironmentConfig(): AICoreCredentials | null {
  if (!hasEnvironmentConfig()) {
    return null;
  }

  const serviceUrl = process.env.AICORE_SERVICE_URL!;

  return {
    clientid: process.env.AICORE_CLIENT_ID!,
    clientsecret: process.env.AICORE_CLIENT_SECRET!,
    url: serviceUrl.replace('/v2', ''), // Base URL
    serviceurls: {
      AI_API_URL: serviceUrl
    }
  };
}

/**
 * Load project config
 */
async function loadProjectConfig(): Promise<GlobalConfig | null> {
  for (const file of PROJECT_CONFIG_FILES) {
    if (existsSync(file)) {
      try {
        const content = await readFile(file, 'utf-8');
        return JSON.parse(content);
      } catch {
        continue;
      }
    }
  }
  return null;
}

/**
 * Load user config (with legacy fallback)
 */
async function loadUserConfig(): Promise<GlobalConfig | null> {
  // Try new location first
  if (existsSync(USER_CONFIG_FILE)) {
    try {
      const content = await readFile(USER_CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Fall through to legacy
    }
  }

  // Try legacy location
  if (existsSync(LEGACY_CONFIG_FILE)) {
    try {
      const content = await readFile(LEGACY_CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Load system config
 */
async function loadSystemConfig(): Promise<GlobalConfig | null> {
  if (!existsSync(SYSTEM_CONFIG_FILE)) {
    return null;
  }

  try {
    const content = await readFile(SYSTEM_CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Load config with proper priority order
 * 1. Environment variables
 * 2. Project config
 * 3. User config
 * 4. System config
 */
export async function loadGlobalConfig(): Promise<GlobalConfig | null> {
  // 1. Environment variables (highest priority)
  const envCreds = loadEnvironmentConfig();
  if (envCreds) {
    return { aicore: envCreds };
  }

  // 2. Project config
  const projectConfig = await loadProjectConfig();
  if (projectConfig?.aicore) {
    return projectConfig;
  }

  // 3. User config
  const userConfig = await loadUserConfig();
  if (userConfig?.aicore) {
    return userConfig;
  }

  // 4. System config
  const systemConfig = await loadSystemConfig();
  if (systemConfig?.aicore) {
    return systemConfig;
  }

  return null;
}

/**
 * Save user config (respects XDG on Linux)
 */
export async function saveGlobalConfig(config: GlobalConfig): Promise<void> {
  // Ensure config directory exists
  if (!existsSync(USER_CONFIG_DIR)) {
    await mkdir(USER_CONFIG_DIR, { recursive: true });
  }

  await writeFile(USER_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Load AI Core credentials from .cdsrc-private.json
 * Handles both direct credentials and CF bindings
 */
export async function loadLocalCdsConfig(): Promise<AICoreCredentials | null> {
  try {
    const cdsrcPath = join(process.cwd(), '.cdsrc-private.json');
    if (!existsSync(cdsrcPath)) {
      return null;
    }

    const content = await readFile(cdsrcPath, 'utf-8');
    const cdsConfig = JSON.parse(content);

    // Check for hybrid profile first
    const binding = cdsConfig?.requires?.['[hybrid]']?.aicore?.binding
                    || cdsConfig?.requires?.aicore?.binding;

    if (!binding) {
      return null;
    }

    // If it's a CF binding (type: cf), we need to fetch credentials from CF
    if (binding.type === 'cf') {
      return await fetchCfCredentials(binding);
    }

    // Otherwise, assume direct credentials
    return {
      clientid: binding.clientid,
      clientsecret: binding.clientsecret,
      url: binding.url,
      serviceurls: binding.serviceurls
    };
  } catch {
    return null;
  }
}

/**
 * Fetch credentials from CF using service key
 */
async function fetchCfCredentials(binding: any): Promise<AICoreCredentials | null> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const cfCommand = `cf service-key ${binding.instance} ${binding.key}`;
    const { stdout } = await execAsync(cfCommand);

    const jsonStart = stdout.indexOf('{');
    if (jsonStart < 0) {
      return null;
    }

    const serviceKey = JSON.parse(stdout.substring(jsonStart));
    const credentials = serviceKey.credentials;

    if (!credentials) {
      return null;
    }

    return {
      clientid: credentials.clientid,
      clientsecret: credentials.clientsecret,
      url: credentials.url,
      serviceurls: credentials.serviceurls
    };
  } catch {
    return null;
  }
}

/**
 * Set up VCAP_SERVICES from global config
 */
export function setupVcapFromGlobalConfig(credentials: AICoreCredentials): void {
  const vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');
  vcapServices.aicore = [{
    name: 'aicore',
    label: 'aicore',
    tags: ['aicore'],
    credentials
  }];
  process.env.VCAP_SERVICES = JSON.stringify(vcapServices);
}

/**
 * Get config source description for logging
 */
export function getConfigSource(): string {
  if (hasEnvironmentConfig()) {
    return 'Environment variables';
  }
  if (hasProjectConfig()) {
    return 'Project config (.saic-clirc.json)';
  }
  if (hasUserConfig()) {
    return `User config (${USER_CONFIG_FILE})`;
  }
  if (hasSystemConfig()) {
    return 'System config (/etc/saic-cli/config.json)';
  }
  return 'None';
}


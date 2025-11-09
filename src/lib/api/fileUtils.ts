import fs from 'fs/promises';
import path from 'path';
import {
  defaultUsers,
  defaultMenus,
  defaultUserPreferences,
  defaultMfaCodes,
  defaultLogs,
} from './defaultData';

/**
 * Get data directory path
 * In Vercel, we'll use /tmp for temporary storage
 */
export function getDataDir(): string {
  // In production (Vercel), use /tmp directory
  if (process.env.VERCEL) {
    return '/tmp/data';
  }
  // In development, use backend/data
  return path.join(process.cwd(), 'backend', 'data');
}

/**
 * Get default data for a file
 */
 
function getDefaultData(fileName: string): any {
  switch (fileName) {
    case 'users.json':
      return defaultUsers;
    case 'menus.json':
      return defaultMenus;
    case 'userPreferences.json':
      return defaultUserPreferences;
    case 'mfaCodes.json':
      return defaultMfaCodes;
    case 'logs.json':
      return defaultLogs;
    default:
      return null;
  }
}

/**
 * Initialize data file with default data if it doesn't exist
 */
async function initializeDataFile(fileName: string): Promise<void> {
  const defaultData = getDefaultData(fileName);
  if (defaultData !== null) {
    console.info(`Initializing ${fileName} with default data...`);
    await writeJSON(fileName, defaultData);
  }
}

/**
 * Read JSON file
 * Automatically initializes with default data if file doesn't exist
 */
 
export async function readJSON<T = any>(fileName: string): Promise<T | null> {
  try {
    const filePath = path.join(getDataDir(), fileName);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error: unknown) {
    const err = error as { code?: string };
    // File doesn't exist - initialize with default data
    if (err.code === 'ENOENT') {
      console.info(`File ${fileName} not found. Initializing with default data...`);
      await initializeDataFile(fileName);

      // Try reading again
      try {
        const filePath = path.join(getDataDir(), fileName);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
      } catch (retryError) {
        console.error(`Error reading ${fileName} after initialization:`, retryError);
        // Return default data directly
        return getDefaultData(fileName) as T;
      }
    }

    console.error(`Error reading ${fileName}:`, error);
    // Return default data as fallback
    return getDefaultData(fileName) as T;
  }
}

/**
 * Write JSON file
 */
 
export async function writeJSON(fileName: string, data: any): Promise<boolean> {
  try {
    const dataDir = getDataDir();

    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
}

/**
 * Reset all data to defaults (use with caution!)
 */
export async function resetAllData(): Promise<boolean> {
  try {
    await writeJSON('users.json', defaultUsers);
    await writeJSON('menus.json', defaultMenus);
    await writeJSON('userPreferences.json', defaultUserPreferences);
    await writeJSON('mfaCodes.json', defaultMfaCodes);
    await writeJSON('logs.json', defaultLogs);
    console.info('All data reset to defaults successfully');
    return true;
  } catch (error) {
    console.error('Error resetting data:', error);
    return false;
  }
}

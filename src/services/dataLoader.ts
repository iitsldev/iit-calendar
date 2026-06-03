/**
 * Service to load data files locally first and fetch updates from GitHub once a day.
 */

const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/dhammanana/iit-calendar/refs/heads/main/src/data/';

/**
 * Loads the data file synchronously from localStorage cache, falling back to the bundled data.
 */
export function loadDataFile<T>(filename: string, bundledData: T): T {
  /*
  const cached = localStorage.getItem(`cached_file_${filename}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && (Array.isArray(parsed) || typeof parsed === 'object')) {
        return parsed as T;
      }
    } catch (e) {
      console.warn(`Error parsing cached file: ${filename}, falling back to bundled data.`, e);
      localStorage.removeItem(`cached_file_${filename}`);
    }
  }
  */
  return bundledData;
}

/**
 * Checks once a day if a newer version of the file exists on GitHub.
 * If so, fetches it, caches it locally, and calls onUpdate callback to refresh the UI.
 */
export async function updateDataFileInBackground(
  filename: string,
  onUpdate: (newData: any) => void
): Promise<void> {
  const now = Date.now();
  const lastCheckStr = localStorage.getItem(`last_check_${filename}`);
  const lastCheck = lastCheckStr ? parseInt(lastCheckStr, 10) : 0;
  
  // 24 hours in milliseconds
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000;
  
  if (now - lastCheck < CHECK_INTERVAL) {
    // Already checked within the last 24 hours
    return;
  }

  try {
    console.log(`Checking for background update of ${filename} from GitHub...`);
    const response = await fetch(`${GITHUB_BASE_URL}${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
    }
    
    const text = await response.text();
    // Validate text is valid JSON before caching
    const data = JSON.parse(text);
    
    if (data && (Array.isArray(data) || typeof data === 'object')) {
      localStorage.setItem(`cached_file_${filename}`, text);
      localStorage.setItem(`last_check_${filename}`, now.toString());
      console.log(`Successfully updated ${filename} in background cache.`);
      onUpdate(data);
    }
  } catch (error) {
    console.warn(`Failed to update ${filename} in background. Working with offline/cached copy.`, error);
    // Even if it failed, we record the check time to prevent spamming failed network requests
    localStorage.setItem(`last_check_${filename}`, now.toString());
  }
}

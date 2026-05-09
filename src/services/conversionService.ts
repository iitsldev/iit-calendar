
import { TextProcessor, Script } from '../lib/pali-script';

export const SCRIPTS: Record<string, string> = {
  roman: Script.RO,
  sinhala: Script.SI,
  burmese: Script.MY,
  thai: Script.THAI,
};

const cache: Record<string, string> = {};

export async function convertPali(text: string, targetScript: string): Promise<string> {
  if (!text) return '';
  const target = SCRIPTS[targetScript] || Script.RO;
  if (target === Script.RO) return text;
  
  const cacheKey = `${text}_${target}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    // Basic pali-script conversion:
    // First convert to Sinhala (the pivot script), then to target
    // IF the source is Roman, convertFrom handles that.
    let baseSinhalaText = TextProcessor.convertFromMixed(text); 
    const result = TextProcessor.convert(baseSinhalaText, target);
    cache[cacheKey] = result;
    return result;
  } catch (e) {
    console.error('TextProcessor conversion failed:', e);
  }
  
  return text;
}

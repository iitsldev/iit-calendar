
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
    // Safely skip HTML tags during conversion
    const parts = text.split(/(<[^>]+>)/g);
    const result = parts.map((part, index) => {
      // Even indices are text content, odd are tags
      if (index % 2 === 0 && part.trim()) {
        const baseSinhalaText = TextProcessor.convertFromMixed(part);
        return TextProcessor.convert(baseSinhalaText, target);
      }
      return part;
    }).join('');

    cache[cacheKey] = result;
    return result;
  } catch (e) {
    console.error('TextProcessor conversion failed:', e);
  }
  
  return text;
}

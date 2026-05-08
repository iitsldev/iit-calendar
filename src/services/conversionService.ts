
import Aksharamukha from 'aksharamukha';

export const SCRIPTS: Record<string, string> = {
  roman: 'ISO',
  sinhala: 'Sinhala',
  burmese: 'Burmese',
  thai: 'Thai'
};

const cache: Record<string, string> = {};
let aksharamukhaEngine: any = null;

async function getEngine() {
  if (!aksharamukhaEngine) {
    try {
      const Akshara = (Aksharamukha as any).default || Aksharamukha;
      aksharamukhaEngine = await Akshara.new();
    } catch (e) {
      console.error('Failed to initialize Aksharamukha engine', e);
      return null;
    }
  }
  return aksharamukhaEngine;
}

export async function convertPali(text: string, targetScript: string): Promise<string> {
  if (!text) return '';
  const target = SCRIPTS[targetScript] || 'ISO';
  if (target === 'ISO') return text;
  
  const cacheKey = `${text}_${target}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const engine = await getEngine();
  if (engine) {
    try {
      // Use 'Roman' or 'ISO' as source. Usually the text is in Roman (ISOPali)
      const result = await engine.process('Roman', target, text);
      cache[cacheKey] = result;
      return result;
    } catch (e) {
      console.error('Aksharamukha local conversion failed:', e);
    }
  }
  
  return text;
}

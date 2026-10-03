/**
 * Utility functions for safely decoding and handling HTML entities.
 */

/**
 * Decodes HTML entity names and numeric character references into their Unicode character equivalents,
 * while preserving '<' and '>' to avoid breaking HTML structures when re-rendered.
 */
export function decodeHtmlEntities(str: string): string {
  if (!str || !str.includes('&')) return str;
  return str.replace(/&(?:#([0-9]+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z0-9]+));/g, (match, dec, hex, name) => {
    if (dec) {
      const code = parseInt(dec, 10);
      if (code === 60) return '&lt;';
      if (code === 62) return '&gt;';
      return String.fromCodePoint(code);
    }
    if (hex) {
      const code = parseInt(hex, 16);
      if (code === 60) return '&lt;';
      if (code === 62) return '&gt;';
      return String.fromCodePoint(code);
    }
    switch (name) {
      case 'mdash': return '—';
      case 'ndash': return '–';
      case 'hellip': return '…';
      case 'nbsp': return '\u00A0';
      case 'thinsp': return '\u2009';
      case 'ensp': return '\u2002';
      case 'emsp': return '\u2003';
      case 'quot': return '"';
      case 'apos': return "'";
      case 'rsquo': return '’';
      case 'lsquo': return '‘';
      case 'rdquo': return '”';
      case 'ldquo': return '“';
      case 'bull': return '•';
      case 'copy': return '©';
      case 'reg': return '®';
      case 'trade': return '™';
      case 'lt': return '&lt;';
      case 'gt': return '&gt;';
      case 'amp': return '&amp;';
      default:
        if (typeof document !== 'undefined') {
          const doc = new DOMParser().parseFromString(match, 'text/html');
          const decoded = doc.body.textContent || match;
          if (decoded === '<') return '&lt;';
          if (decoded === '>') return '&gt;';
          return decoded;
        }
        return match;
    }
  });
}

import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { BookSection } from '../../types/book';
import { TextProcessor, Script, buildDiacriticRegexPattern } from '../../lib/pali-script';
import { SCRIPT_TO_LANG } from '../../lib/bookUtils';

interface BookSectionReaderProps {
  sections?: BookSection[];
  selectedSection?: BookSection | null;
  scriptKey: string;
  searchTerm: string;
  language: string;
  t: (key: any) => string;
  tFor: (lang: string, key: string) => string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  totalBookSections?: number;
  hasNextSection?: boolean;
  bookTitle?: string;
}

interface SingleSectionProps {
  section: BookSection;
  scriptKey: string;
  searchTerm: string;
  language: string;
  tFor: (lang: string, key: string) => string;
}

const SingleSection = React.memo(function SingleSection({
  section,
  scriptKey,
  searchTerm,
  language,
  tFor
}: SingleSectionProps) {
  const processedSectionHtml = useMemo(() => {
    if (!section) return '';
    let html = section.html;

    // Chant notes should follow the active Pāḷi script, not the UI language.
    const chantNoteLang = SCRIPT_TO_LANG[scriptKey] || language;

    // Process data-i18n-key attribute translations
    html = html.replace(/<([a-z0-9]+)([^>]*?)data-i18n-key="([^"]+)"([^>]*?)>([\s\S]*?)<\/\1>/gi, (match, tag, beforeAttrs, key, afterAttrs, content) => {
      const translated = tFor(chantNoteLang, key) || content;
      return `<${tag}${beforeAttrs}data-i18n-key="${key}" data-no-transliterate="true"${afterAttrs}>${translated}</${tag}>`;
    });

    if (scriptKey !== Script.RO) {
      const tagRegex = /(<[^>]+>)/g;
      const parts = html.split(tagRegex);
      let skipTransliteration = false;

      html = parts.map((part, index) => {
        if (index % 2 === 1) {
          if (/data-no-transliterate="true"/i.test(part) || /class="[^"]*chant-note[^"]*"/i.test(part)) {
            if (!part.startsWith('</')) {
              skipTransliteration = true;
            }
          }
          if (part.startsWith('</') && skipTransliteration) {
            skipTransliteration = false;
          }
          return part;
        } else {
          if (skipTransliteration || !part.trim()) return part;
          if (part.length === 1 && /[\s,.;:!?]/.test(part)) return part;

          try {
            const baseScriptText = TextProcessor.convertFrom(part, Script.RO);
            return TextProcessor.convert(baseScriptText, scriptKey);
          } catch {
            return part;
          }
        }
      }).join('');
    }

    if (searchTerm.trim() && searchTerm.length >= 2) {
      let searchPattern = searchTerm;
      if (scriptKey !== Script.RO && /^[a-zA-Zāīūṃṅñṭḍṇḷḥ\s,.'"-]+$/i.test(searchTerm)) {
        try {
          const baseScriptText = TextProcessor.convertFrom(searchTerm, Script.RO);
          searchPattern = TextProcessor.convert(baseScriptText, scriptKey);
        } catch (e) {
          console.error("Search term conversion failed", e);
        }
      }

      try {
        const diacriticPattern = buildDiacriticRegexPattern(searchPattern);
        const regex = new RegExp(`(?![^<]*>)(${diacriticPattern})`, 'gi');
        html = html.replace(regex, (match) => `<mark class="bg-amber-200 dark:bg-amber-500/40 text-slate-900 dark:text-white rounded px-0.5 ring-1 ring-amber-400/50 transition-all duration-300">${match}</mark>`);
      } catch {
        const escapedSearch = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?![^<]*>)(${escapedSearch})`, 'gi');
        html = html.replace(regex, (match) => `<mark class="bg-amber-200 dark:bg-amber-500/40 text-slate-900 dark:text-white rounded px-0.5 ring-1 ring-amber-400/50 transition-all duration-300">${match}</mark>`);
      }
    }

    return html;
  }, [section, scriptKey, searchTerm, language, tFor]);

  return (
    <div
      id={`section-container-${section.id}`}
      data-section-id={section.id}
      className="book-section-block relative"
    >
      <div
        className="book-container prose prose-stone dark:prose-invert prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-saffron dark:prose-headings:text-amber-500 max-w-none prose-a:text-saffron prose-strong:text-slate-900 dark:prose-strong:text-slate-100"
        script={scriptKey}
        dangerouslySetInnerHTML={{ __html: processedSectionHtml }}
      />
    </div>
  );
});

export function BookSectionReader({
  sections,
  selectedSection,
  scriptKey,
  searchTerm,
  language,
  t,
  tFor,
  contentRef,
  totalBookSections,
  hasNextSection,
  bookTitle
}: BookSectionReaderProps) {
  const sectionsToRender = useMemo(() => {
    if (sections && sections.length > 0) return sections;
    if (selectedSection) return [selectedSection];
    return [];
  }, [sections, selectedSection]);

  return (
    <div ref={contentRef} className="book-content px-4 sm:px-8 mt-2 overflow-wrap-anywhere">
      <style>{`
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .book-container h1 {
          font-size: 2rem !important;
          border-bottom: 2px solid var(--accent);
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem !important;
          line-height: 1.2;
        }
        .book-container h2 {
          font-size: 1.6rem !important;
          color: var(--accent);
          margin-top: 1.5rem !important;
          margin-bottom: 1rem !important;
          font-weight: bold;
          line-height: 1.3;
        }
        .book-container h3 {
          font-size: 1.3rem !important;
          font-weight: 700 !important;
          font-style: normal !important;
          color: var(--accent);
          margin-top: 1.75rem !important;
          margin-bottom: 0.75rem !important;
          line-height: 1.35;
        }
        .book-container .chant-note {
          display: inline-block;
          font-style: italic;
          font-weight: 600;
          color: var(--accent);
          margin: 0 0.25rem;
        }
        .book-container div.chant-note,
        .book-container p.chant-note,
        .book-container blockquote.chant-note {
          display: block;
          border-left: 3px solid var(--accent);
          background: var(--accent-soft);
          padding: 0.5rem 0.85rem;
          margin: 0.75rem 0;
          border-radius: 0.5rem;
          font-style: normal;
          font-weight: 600;
          color: var(--text-primary);
        }
        .book-container p {
          margin-bottom: 0.6rem !important;
          font-size: 1.1rem;
        }
        .book-container li p {
          margin-bottom: 0.35rem !important;
        }
        .book-container ol {
          list-style-type: decimal !important;
          padding-left: 2rem !important;
          margin-top: 0.75rem !important;
          margin-bottom: 1rem !important;
        }
        .book-container ul {
          list-style-type: disc !important;
          padding-left: 2rem !important;
          margin-top: 0.75rem !important;
          margin-bottom: 1rem !important;
        }
        .book-container li {
          display: list-item !important;
          margin-bottom: 0.75rem !important;
        }
        .book-container li::marker {
          font-weight: bold;
          color: var(--accent);
        }
        mark {
          scroll-margin-top: 100px;
        }
      `}</style>

      {sectionsToRender.map((section, idx) => (
        <React.Fragment key={section.id}>
          <SingleSection
            section={section}
            scriptKey={scriptKey}
            searchTerm={searchTerm}
            language={language}
            tFor={tFor}
          />

          {idx < sectionsToRender.length - 1 && (
            <div className="my-10 flex items-center justify-center gap-3 opacity-35 dark:opacity-25" aria-hidden="true">
              <div className="h-px w-14 bg-gradient-to-r from-transparent to-amber-600 dark:to-amber-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
              <div className="h-px w-14 bg-gradient-to-l from-transparent to-amber-600 dark:to-amber-400" />
            </div>
          )}
        </React.Fragment>
      ))}

      {hasNextSection && (
        <div className="py-8 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 animate-pulse" aria-hidden="true">
          <div className="flex items-center gap-1.5 text-xs font-serif tracking-wider text-amber-700/60 dark:text-amber-400/60">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {!hasNextSection && totalBookSections !== undefined && totalBookSections > 0 && sectionsToRender.length > 0 && (
        <div className="mt-14 mb-8 pt-8 border-t border-amber-500/20 text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-2.5 shadow-inner">
            <BookOpen size={18} />
          </div>
          {bookTitle && (
            <p className="text-sm font-serif font-semibold text-[var(--text-primary)]">
              {bookTitle}
            </p>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-0.5 tracking-wider uppercase font-medium">
            {t('common.endOfBook') || 'End of Book'}
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, List, X, ChevronRight, Search, ChevronUp, ChevronDown, Library } from 'lucide-react';
import { cn } from '../lib/utils';
import chantBookHtml from '../data/chantingbook.html?raw';
import memorizationHtml from '../data/memorization.html?raw';
import { useI18n } from '../hooks/useI18n';
import { Settings, PaliScript } from '../types';
import { TextProcessor, Script } from '../lib/pali-script';

import { SCRIPTS } from '../services/conversionService';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

const BOOKS = {
  chanting: {
    titleKey: 'common.chantingBook',
    html: chantBookHtml
  },
  memorization: {
    titleKey: 'common.memorization',
    html: memorizationHtml
  }
} as const;

type BookType = keyof typeof BOOKS;

function getScriptKey(paliScript: PaliScript): string {
  return SCRIPTS[paliScript] || Script.RO;
}

function parseTocFromHtml(html: string, paliScript: PaliScript): TocItem[] {
  const items: TocItem[] = [];
  const regex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let match;
  const scriptKey = getScriptKey(paliScript);

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    // Strip any inner HTML tags to get plain text
    let title = match[3].replace(/<[^>]+>/g, '').trim();
    
    if (scriptKey !== Script.RO) {
      const sinhala = TextProcessor.convertFrom(title, Script.RO);
      title = TextProcessor.convert(sinhala, scriptKey);
    }
    
    items.push({ id, title, level });
  }
  return items;
}

export function BookScreen({ settings }: { settings: Settings }) {
  const { t } = useI18n();
  const [showToc, setShowToc] = useState(false);
  const [activeBook, setActiveBook] = useState<BookType>('chanting');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [totalMatches, setTotalMatches] = useState(0);
  
  const currentHtml = BOOKS[activeBook].html;
  const toc = useMemo(() => parseTocFromHtml(currentHtml, settings.paliScript), [currentHtml, settings.paliScript]);
  const contentRef = useRef<HTMLDivElement>(null);

  const processedHtml = useMemo(() => {
    let html = currentHtml;
    const scriptKey = getScriptKey(settings.paliScript);

    if (scriptKey !== Script.RO) {
      const parts = html.split(/(<[^>]+>)/g);
      html = parts.map((part, index) => {
        // Even indices are text nodes (content between tags)
        if (index % 2 === 0 && part.trim()) {
          // Special case: don't convert if it looks like an HTML entity or is just punctuation
          if (part.length === 1 && /[\s,.;:!?]/.test(part)) return part;
          
          try {
            const sinhala = TextProcessor.convertFrom(part, Script.RO);
            return TextProcessor.convert(sinhala, scriptKey);
          } catch (e) {
            console.error("Conversion failed for part:", part, e);
            return part;
          }
        }
        // Odd indices are the tags themselves, return unchanged
        return part;
      }).join('');
    }

    if (searchTerm.trim() && searchTerm.length >= 2) {
      let searchPattern = searchTerm;
      // If book is not Roman and search is Roman-ish, convert search term to match
      if (scriptKey !== Script.RO && /^[a-zA-Zāīūṃṅñṭḍṇḷḥ\s,.'"-]+$/i.test(searchTerm)) {
        try {
          const sinhala = TextProcessor.convertFrom(searchTerm, Script.RO);
          searchPattern = TextProcessor.convert(sinhala, scriptKey);
        } catch (e) {
          console.error("Search term conversion failed", e);
        }
      }

      const escapedSearch = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?![^<]*>)${escapedSearch}`, 'gi');
      html = html.replace(regex, (match) => `<mark class="bg-amber-200 dark:bg-amber-500/40 text-slate-900 dark:text-white rounded px-0.5 ring-1 ring-amber-400/50 transition-all duration-300">${match}</mark>`);
    }

    return html;
  }, [currentHtml, settings.paliScript, searchTerm]);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setTotalMatches(0);
      setCurrentMatchIndex(-1);
      return;
    }

    // Wait for DOM to update with processedHtml
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const marks = contentRef.current.querySelectorAll('mark');
        setTotalMatches(marks.length);
        if (marks.length > 0) {
          setCurrentMatchIndex(0);
          marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          marks[0].classList.add('ring-2', 'ring-amber-600', 'dark:ring-amber-300', 'scale-110');
        } else {
          setCurrentMatchIndex(-1);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [processedHtml, searchTerm]);

  const navigateMatch = (direction: 'next' | 'prev') => {
    if (totalMatches === 0 || !contentRef.current) return;

    const marks = contentRef.current.querySelectorAll('mark');
    // Remove previous active highlight
    if (currentMatchIndex >= 0 && marks[currentMatchIndex]) {
       marks[currentMatchIndex].classList.remove('ring-2', 'ring-amber-600', 'dark:ring-amber-300', 'scale-110');
    }

    let nextIndex = direction === 'next' ? currentMatchIndex + 1 : currentMatchIndex - 1;
    
    // Cycle logic
    if (nextIndex >= totalMatches) nextIndex = 0;
    if (nextIndex < 0) nextIndex = totalMatches - 1;

    setCurrentMatchIndex(nextIndex);
    const target = marks[nextIndex];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-2', 'ring-amber-600', 'dark:ring-amber-300', 'scale-110');
    }
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setShowToc(false);
  };

  const toggleBook = () => {
    setActiveBook(prev => prev === 'chanting' ? 'memorization' : 'chanting');
    setSearchTerm('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 relative animate-in fade-in duration-500">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 flex justify-between items-center rounded-b-3xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col">
          <h2 className="hidden sm:flex font-serif text-2xl font-bold text-saffron dark:text-amber-500 items-center gap-2">
            <BookOpen size={24} /> {t(BOOKS[activeBook].titleKey as any)}
          </h2>
          {searchTerm && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-0 sm:ml-8">
              {totalMatches > 0 ? `${currentMatchIndex + 1} / ${totalMatches}` : t('settings.searching')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative group flex-1 sm:flex-initial">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-saffron transition-colors" />
            <input
              type="text"
              placeholder={`${t('common.search')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 pl-10 pr-8 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 transition-all sm:focus:w-64"
            />
            {searchTerm && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <button 
                  onClick={() => navigateMatch('prev')}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  onClick={() => navigateMatch('next')}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={toggleBook}
            title={t(activeBook === 'chanting' ? 'common.memorization' : 'common.chantingBook' as any)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95 flex-shrink-0"
          >
            <Library size={20} />
          </button>
          <button 
            onClick={() => setShowToc(true)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95 flex-shrink-0"
          >
            <List size={20} />
          </button>
        </div>
      </header>

      <div className="book-content px-4 sm:px-8 mt-8 overflow-wrap-anywhere">
        <style>{`
          .overflow-wrap-anywhere {
            overflow-wrap: anywhere;
            word-break: break-word;
          }
          .book-container h1 {
            font-size: 2.25rem !important;
            border-bottom: 2px solid var(--accent);
            padding-bottom: 0.5rem;
            margin-bottom: 2rem !important;
            line-height: 1.2;
          }
          .book-container h2 {
            font-size: 1.6rem !important;
            color: var(--accent);
            margin-top: 2.5rem !important;
            margin-bottom: 1rem !important;
            font-weight: bold;
            line-height: 1.3;
          }
          .book-container h3 {
            font-size: 1.3rem !important;
            font-style: italic;
            margin-top: 1.5rem !important;
          }
          .book-container p {
            margin-bottom: 1rem !important;
            font-size: 1.1rem;
          }
          mark {
            scroll-margin-top: 100px;
          }
        `}</style>
        <div
          ref={contentRef}
          className="book-container prose prose-stone dark:prose-invert prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-saffron dark:prose-headings:text-amber-500 max-w-none prose-a:text-saffron prose-strong:text-slate-900 dark:prose-strong:text-slate-100"
          script={getScriptKey(settings.paliScript)}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      </div>

      <AnimatePresence>
        {showToc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToc(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-[60] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col rounded-l-3xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-200">Table of Contents</h3>
                <button onClick={() => setShowToc(false)} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full active:scale-95 transition-all"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1 pb-10 scrollbar-hide">
                {toc.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToId(item.id)}
                    className={cn(
                      "w-full text-left py-2.5 px-3 rounded-xl transition-colors hover:bg-saffron/10 dark:hover:bg-saffron/20 group flex items-start gap-2",
                      item.level === 1 ? "font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 text-lg border-b border-slate-100 dark:border-slate-800/50 pb-2" : "text-sm text-slate-600 dark:text-slate-400 pl-4"
                    )}
                  >
                    {item.level > 1 && <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-saffron mt-0.5 flex-shrink-0" />}
                    <span className="leading-snug">{item.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

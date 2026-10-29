'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { STORE_LINKS } from './StoreButtons';
import { SupportedLanguage, TRANSLATIONS } from './i18n';

interface SiteFooterProps {
  lang?: SupportedLanguage;
}

export default function SiteFooter({ lang: propLang }: SiteFooterProps) {
  const [lang, setLang] = useState<SupportedLanguage>(propLang || 'en');

  useEffect(() => {
    if (propLang) {
      setLang(propLang);
      return;
    }
    try {
      const savedLang = localStorage.getItem('iit_website_lang') as SupportedLanguage;
      if (savedLang && TRANSLATIONS[savedLang]) {
        setLang(savedLang);
      }
    } catch {
      // ignore
    }
  }, [propLang]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <footer className="site-footer" style={{ marginTop: 'auto' }}>
      <div className="site-container">
        <div className="blessing-text">{t.footer.blessing}</div>

        <ul className="footer-nav">
          <li>
            <a href={STORE_LINKS.appleAppStore} target="_blank" rel="noopener noreferrer">
              {t.footer.appStore}
            </a>
          </li>
          <li>
            <a href={STORE_LINKS.googlePlayStore} target="_blank" rel="noopener noreferrer">
              {t.footer.googlePlay}
            </a>
          </li>
          <li>
            <Link href="/privacy">{t.footer.privacyPolicy}</Link>
          </li>
          <li>
            <Link href="/terms">{t.footer.terms}</Link>
          </li>
          <li>
            <a href={STORE_LINKS.gitHub} target="_blank" rel="noopener noreferrer">
              {t.footer.github}
            </a>
          </li>
        </ul>

        <div className="footer-copyright" style={{ marginTop: '16px' }}>
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}


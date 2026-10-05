'use client';

import React from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from './i18n';

interface LanguageSwitcherProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export default function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) {
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="language-selector-wrap" title={`Language: ${currentLang.name}`}>
      {/* Visual Pill Display */}
      <div className="language-current-display" aria-hidden="true">
        <span className="lang-flag">{currentLang.flag}</span>
        <span className="lang-name">{currentLang.name}</span>
        <span className="language-chevron">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {/* Accessible native select covering entire pill for click/touch */}
      <select
        id="language-select"
        aria-label="Select Language"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
        className="language-native-select"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName === lang.name ? lang.name : `${lang.nativeName} (${lang.name})`}
          </option>
        ))}
      </select>
    </div>
  );
}

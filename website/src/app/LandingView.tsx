'use client';

import React, { useState, useEffect } from 'react';
import { AppleStoreButton, GooglePlayButton, STORE_LINKS } from './StoreButtons';
import ScreenIcon from './ScreenIcon';
import TriagePhoneFrame from './TriagePhoneFrame';
import LanguageSwitcher from './LanguageSwitcher';
import { SupportedLanguage, TRANSLATIONS } from './i18n';

export default function LandingView() {
  const [lang, setLang] = useState<SupportedLanguage>('en');

  // Load language preference from localStorage or browser language on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('iit_website_lang') as SupportedLanguage;
      if (savedLang && TRANSLATIONS[savedLang]) {
        setLang(savedLang);
        return;
      }

      const browserLang = navigator.language?.toLowerCase().split('-')[0] as SupportedLanguage;
      if (browserLang && TRANSLATIONS[browserLang]) {
        setLang(browserLang);
      }
    } catch {
      // localStorage may be unavailable in some environments
    }
  }, []);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLang(newLang);
    try {
      localStorage.setItem('iit_website_lang', newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore storage errors
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <div style={{ width: '100%' }}>
      <main id="main-content">
        {/* ── Hero Section (Monastic Saffron Gold Theme — Calendar Focus) ──────── */}
        <section className="hero-section">
          <div className="site-container">
            {/* Integrated Top Navigation */}
            <header className="top-nav">
              <div className="brand-identity">
                <div className="brand-emblem">
                  <img src="/logo.png" alt="IIT Monastery Emblem" width={44} height={44} />
                </div>
                <div className="brand-meta">
                  <span className="brand-name">{t.brandName}</span>
                  <p>{t.institute}</p>
                </div>
              </div>

              <LanguageSwitcher
                currentLanguage={lang}
                onLanguageChange={handleLanguageChange}
              />
            </header>

            {/* Hero Grid */}
            <div className="hero-grid">
              <div className="hero-text">
                <span className="hero-badge">{t.badge}</span>
                <h1 className="hero-title">{t.heroTitle}</h1>
                <p className="hero-desc">{t.heroDesc}</p>

                {/* Store Badges */}
                <div className="store-actions">
                  <AppleStoreButton id="hero-cta-apple-app-store" />
                  <GooglePlayButton id="hero-cta-google-play-store" />
                </div>

                <p className="dana-note">{t.danaNote}</p>
              </div>

              {/* Hero Phone Mockup: Calendar Screen with Saffron Header */}
              <div className="phone-column-wrapper">
                <TriagePhoneFrame
                  screenType="calendar"
                  headerClass="header-grad-calendar"
                  screenTitle={t.screens.calendar.title}
                  imageSrc="/screenshots/calendar.png"
                  placeholderPath="/screenshots/calendar.png"
                  priority={true}
                />
              </div>
            </div>
          </div>
        </section>

      {/* ── Screen Block 1: Sacred Lotus Chants (Rose / Lotus Theme) ─────────── */}
      <section className="screen-block theme-chants">
        <div className="site-container">
          <div className="screen-block-inner">
            {/* Action Text on Left */}
            <div className="screen-block-content">
              <div className="screen-block-icon-badge">
                <ScreenIcon name="chants" size={30} />
              </div>
              <span className="screen-block-tag">{t.screens.chants.tag}</span>
              <h2 className="screen-block-title">{t.screens.chants.title}</h2>
              <p className="screen-block-desc">{t.screens.chants.subtitle}</p>

              <ul className="screen-block-points">
                {t.screens.chants.points.map((pt, i) => (
                  <li key={i} className="screen-block-point">
                    <span className="screen-block-point-bullet" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Mockup on Right */}
            <div className="phone-column-wrapper">
              <TriagePhoneFrame
                screenType="chants"
                headerClass="header-grad-chants"
                screenTitle={t.screens.chants.title}
                imageSrc="/screenshots/chants.png"
                placeholderPath="/screenshots/chants.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen Block 2: Stillness Meditation (Forest Emerald Theme) ───────── */}
      <section className="screen-block theme-meditation">
        <div className="site-container">
          <div className="screen-block-inner">
            {/* Action Text on Left */}
            <div className="screen-block-content">
              <div className="screen-block-icon-badge">
                <ScreenIcon name="meditation" size={30} />
              </div>
              <span className="screen-block-tag">{t.screens.meditation.tag}</span>
              <h2 className="screen-block-title">{t.screens.meditation.title}</h2>
              <p className="screen-block-desc">{t.screens.meditation.subtitle}</p>

              <ul className="screen-block-points">
                {t.screens.meditation.points.map((pt, i) => (
                  <li key={i} className="screen-block-point">
                    <span className="screen-block-point-bullet" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Mockup on Right */}
            <div className="phone-column-wrapper">
              <TriagePhoneFrame
                screenType="meditation"
                headerClass="header-grad-meditation"
                screenTitle={t.screens.meditation.title}
                imageSrc="/screenshots/meditation.png"
                placeholderPath="/screenshots/meditation.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen Block 3: Dhamma Books (Ancient Sandstone Ochre Theme) ──────── */}
      <section className="screen-block theme-books">
        <div className="site-container">
          <div className="screen-block-inner">
            {/* Action Text on Left */}
            <div className="screen-block-content">
              <div className="screen-block-icon-badge">
                <ScreenIcon name="books" size={28} />
              </div>
              <span className="screen-block-tag">{t.screens.books.tag}</span>
              <h2 className="screen-block-title">{t.screens.books.title}</h2>
              <p className="screen-block-desc">{t.screens.books.subtitle}</p>

              <ul className="screen-block-points">
                {t.screens.books.points.map((pt, i) => (
                  <li key={i} className="screen-block-point">
                    <span className="screen-block-point-bullet" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Mockup on Right */}
            <div className="phone-column-wrapper">
              <TriagePhoneFrame
                screenType="books"
                headerClass="header-grad-books"
                screenTitle={t.screens.books.title}
                imageSrc="/screenshots/books.png"
                placeholderPath="/screenshots/books.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Screen Block 4: Dhamma Study (Deep Tipitaka Indigo Theme) ────────── */}
      <section className="screen-block theme-study">
        <div className="site-container">
          <div className="screen-block-inner">
            {/* Action Text on Left */}
            <div className="screen-block-content">
              <div className="screen-block-icon-badge">
                <ScreenIcon name="study" size={28} />
              </div>
              <span className="screen-block-tag">{t.screens.study.tag}</span>
              <h2 className="screen-block-title">{t.screens.study.title}</h2>
              <p className="screen-block-desc">{t.screens.study.subtitle}</p>

              <ul className="screen-block-points">
                {t.screens.study.points.map((pt, i) => (
                  <li key={i} className="screen-block-point">
                    <span className="screen-block-point-bullet" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Mockup on Right */}
            <div className="phone-column-wrapper">
              <TriagePhoneFrame
                screenType="study"
                headerClass="header-grad-study"
                screenTitle={t.screens.study.title}
                imageSrc="/screenshots/study.png"
                placeholderPath="/screenshots/study.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Highlights Grid (Inspired by Triage 2x3 Colored Cards) ───────────── */}
      <section className="highlights-section">
        <div className="site-container">
          <div className="highlights-header">
            <h2>{t.insideAppTitle}</h2>
            <p>{t.insideAppSubtitle}</p>
          </div>

          <div className="highlights-grid">
            {/* Card 1: Gold / Vinaya Calculations */}
            <div className="highlight-card card-gold">
              <div>
                <div className="highlight-card-icon">
                  <ScreenIcon name="calendar" size={22} />
                </div>
                <h3 className="highlight-card-title">{t.highlights.vinaya.title}</h3>
              </div>
              <p className="highlight-card-desc">{t.highlights.vinaya.desc}</p>
            </div>

            {/* Card 2: Green / Monastic Audio & Bells (Replaces Stillness) */}
            <div className="highlight-card card-green">
              <div>
                <div className="highlight-card-icon">
                  <ScreenIcon name="audio" size={22} />
                </div>
                <h3 className="highlight-card-title">{t.highlights.audio.title}</h3>
              </div>
              <p className="highlight-card-desc">{t.highlights.audio.desc}</p>
            </div>

            {/* Card 3: Rose / Multi-Script Pāli Engine */}
            <div className="highlight-card card-rose">
              <div>
                <div className="highlight-card-icon">
                  <ScreenIcon name="chants" size={22} />
                </div>
                <h3 className="highlight-card-title">{t.highlights.scripts.title}</h3>
              </div>
              <p className="highlight-card-desc">{t.highlights.scripts.desc}</p>
            </div>

            {/* Card 4: Ochre / Monastery Presets & GPS (Replaces Dhamma Books) */}
            <div className="highlight-card card-ochre">
              <div>
                <div className="highlight-card-icon">
                  <ScreenIcon name="location" size={22} />
                </div>
                <h3 className="highlight-card-title">{t.highlights.location.title}</h3>
              </div>
              <p className="highlight-card-desc">{t.highlights.location.desc}</p>
            </div>

            {/* Card 5: Indigo / Theravāda Traditions (Replaces Study Focus) */}
            <div className="highlight-card card-indigo">
              <div>
                <div className="highlight-card-icon">
                  <ScreenIcon name="traditions" size={22} />
                </div>
                <h3 className="highlight-card-title">{t.highlights.traditions.title}</h3>
              </div>
              <p className="highlight-card-desc">{t.highlights.traditions.desc}</p>
            </div>

            {/* Card 6: Charcoal / 100% Offline & Private */}
            <div className="highlight-card card-charcoal">
              <div>
                <div className="highlight-card-icon">
                  <ScreenIcon name="privacy" size={20} />
                </div>
                <h3 className="highlight-card-title">{t.highlights.privacy.title}</h3>
              </div>
              <p className="highlight-card-desc">{t.highlights.privacy.desc}</p>
            </div>
          </div>
        </div>
      </section>


      {/* ── Bottom Download CTA Section ────────────────────────────────────── */}
      <section className="download-cta-section">
        <div className="site-container">
          <div className="store-actions">
            <AppleStoreButton id="bottom-cta-apple-app-store" />
            <GooglePlayButton id="bottom-cta-google-play-store" />
          </div>
          <p className="dana-note" style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            {t.danaNote}
          </p>
        </div>
      </section>
    </main>

      {/* ── Monastic Footer ────────────────────────────────────────────────── */}
      <footer className="site-footer">
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
              <a href="/privacy">{t.footer.privacyPolicy}</a>
            </li>
            <li>
              <a href="/terms">{t.footer.terms}</a>
            </li>
            <li>
              <a href={STORE_LINKS.gitHub} target="_blank" rel="noopener noreferrer">
                {t.footer.github}
              </a>
            </li>
          </ul>

          <div className="footer-copyright" style={{ marginTop: '16px' }}>{t.footer.copyright}</div>
        </div>
      </footer>
    </div>
  );
}

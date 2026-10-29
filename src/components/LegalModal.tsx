import React from 'react';
import { ExternalLink, Shield, FileText, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { useI18n } from '../hooks/useI18n';
import { Modal } from './Modal';
import { SegmentedControl } from './SegmentedControl';
import { PrivacyContent } from './legal/PrivacyContent';
import { TermsContent } from './legal/TermsContent';

export function LegalModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [section, setSection] = React.useState<'about' | 'privacy' | 'eula'>('about');

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={t('settings.legal.title')}
      maxWidth="xl"
      className="h-[85vh] max-h-[85vh] px-6 sm:px-8 py-6"
    >

      {/* Tabs */}
      <div className="shrink-0 mb-4 flex justify-center">
        <SegmentedControl
          options={[
            { id: 'about', label: t('settings.legal.about') || 'About', icon: Info },
            { id: 'privacy', label: t('settings.legal.privacy') || 'Privacy Policy', icon: Shield },
            { id: 'eula', label: t('settings.legal.eula') || 'Terms', icon: FileText },
          ]}
          value={section}
          onChange={(val) => setSection(val as any)}
          className="w-full"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 space-y-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {section === 'about' && (
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('settings.legal.aboutTitle') || 'About Sati'}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('settings.legal.aboutP1') || 'Sati has been developed as an effort to support the Dhamma community, with the kind guidance, advice, and encouragement of Ven. Werapitiye Devananda Thera.'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {t('settings.legal.aboutP2') || 'This application is dedicated to all members of the Sangha and devotees who strive to preserve, practise, and share the Dhamma.'}
              </p>
              <p className="text-sm leading-relaxed text-[var(--text-tertiary)] pt-1">
                The source code and content are freely available on{' '}
                <a
                  href="https://github.com/iitsldev/iit-calendar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] font-semibold inline-flex items-center gap-0.5 hover:underline"
                >
                  GitHub <ExternalLink size={11} className="inline" />
                </a>{' '}
                for anyone to use, share, and adapt for non-commercial purposes.
              </p>
            </section>

            <section className="pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
              <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>Attributions</h3>
              <ul className="space-y-4">
                <li className="flex flex-col gap-1">
                  <span className="font-bold">Pali Script Converter & Fonts</span>
                  <span>Provided by <a href="https://tipitaka.lk" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] inline-flex items-center gap-1 hover:underline">tipitaka.lk <ExternalLink size={12} /></a></span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-bold">Buddhist Calendar & Chanting Logic</span>
                  <span>Derived from <a href="https://buddhist-era.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] inline-flex items-center gap-1 hover:underline">Buddhist Era <ExternalLink size={12} /></a></span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="font-bold">Pomodoro Timer Design</span>
                  <span>Inspired by <a href="https://pomofocus.io" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] inline-flex items-center gap-1 hover:underline">Pomofocus <ExternalLink size={12} /></a></span>
                </li>
              </ul>
            </section>
          </div>
        )}

        {section === 'privacy' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h3>
            <p className="text-xs text-[var(--text-tertiary)]">Effective Date: October 29, 2026</p>
            <PrivacyContent />
          </div>
        )}

        {section === 'eula' && (
          <div className="space-y-4">
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Terms of Service</h3>
            <p className="text-xs text-[var(--text-tertiary)]">Effective Date: October 29, 2026</p>
            <TermsContent />
          </div>
        )}
      </div>
    </Modal>
  );
}

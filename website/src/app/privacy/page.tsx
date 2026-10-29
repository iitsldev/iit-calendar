import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PrivacyContent } from '../../../../src/components/legal/PrivacyContent';
import SiteFooter from '../SiteFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Sati, published by International Institute of Theravada. 100% offline, free, and privacy-first. We do not collect, store, or transmit any personal data.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — Sati | International Institute of Theravada',
    description:
      'Privacy Policy for Sati, published by International Institute of Theravada. 100% offline, free, and privacy-first.',
    url: 'https://sati.theravado.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="top-nav site-container" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div className="brand-identity">
          <Link href="/" className="brand-emblem" aria-label="Home">
            <img src="/logo.png" alt="Sati App Icon" width={44} height={44} />
          </Link>
          <div className="brand-meta">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="brand-name">Sati</span>
            </Link>
            <p>International Institute of Theravada</p>
          </div>
        </div>
        <Link
          href="/"
          style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: 'var(--saffron)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Back to Home
        </Link>
      </header>

      <main className="site-container" style={{ flex: 1, padding: '48px 24px', maxWidth: '740px' }}>
        <article>
          <header style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              Legal
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.4rem',
                color: 'var(--text-primary)',
                marginBottom: '8px',
                lineHeight: 1.2,
              }}
            >
              Privacy Policy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Effective Date: October 29, 2026
            </p>
          </header>

          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1.02rem' }}>
            <PrivacyContent />
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}

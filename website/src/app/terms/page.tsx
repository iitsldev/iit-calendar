import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TermsContent } from '../../../../src/components/legal/TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for the Sati mobile application and website, published by International Institute of Theravada.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service — Sati | International Institute of Theravada',
    description:
      'Terms of Service for Sati. Free, open-source, and privacy-first monastic companion software.',
    url: 'https://sati.theravado.com/terms',
  },
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Effective Date: October 29, 2026
            </p>
          </header>

          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1.02rem' }}>
            <TermsContent />
          </div>
        </article>
      </main>

      <footer className="site-footer" style={{ marginTop: 'auto' }}>
        <div className="site-container">
          <div className="blessing-text">Sabbadānaṁ dhammadānaṁ jināti</div>
          <ul className="footer-nav" style={{ marginTop: '12px' }}>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms of Service</Link>
            </li>
          </ul>
          <div className="footer-copyright" style={{ marginTop: '16px' }}>
            © {new Date().getFullYear()} International Institute of Theravada (IIT). Distributed freely as Dāna.
          </div>
        </div>
      </footer>
    </div>
  );
}

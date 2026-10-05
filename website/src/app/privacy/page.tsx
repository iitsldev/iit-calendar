import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'IIT Calendar is 100% offline, free, and privacy-first. We do not collect, store, or transmit any personal data.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — IIT Calendar',
    description:
      'IIT Calendar is 100% offline, free, and privacy-first. We do not collect, store, or transmit any personal data.',
    url: 'https://iit.damsak.org/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="top-nav site-container" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px' }}>
        <div className="brand-identity">
          <Link href="/" className="brand-emblem" style={{ display: 'inline-block' }}>
            <img src="/logo.png" alt="IIT Monastery Emblem" width={44} height={44} />
          </Link>
          <div className="brand-meta">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="brand-name">IIT Calendar</span>
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

      <main className="site-container" style={{ flex: 1, padding: '48px 24px', maxWidth: '760px' }}>
        <article>
          <header style={{ marginBottom: '32px' }}>
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Last updated: June 2026
            </p>
          </header>

          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '1.02rem' }}>
            <section style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                1. Information Collection and Use
              </h2>
              <p>
                The IIT Calendar application respects your privacy completely. We do not collect, store,
                or transmit any personally identifiable information to external servers. All data processed
                by this application remains exclusively on your device.
              </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                2. Location Data
              </h2>
              <p>
                The application may request access to your location data (latitude and longitude) to calculate
                astronomically accurate solar events (dawn <em>Arunuggamana</em> and solar noon <em>Majjhanhike</em>)
                for your specific area. This location data is processed entirely locally on your device and is never
                sent to our servers or any third parties.
              </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                3. Local Storage
              </h2>
              <p>
                The application saves your preferences, settings, and downloaded content (such as study materials,
                chant text scripts, and audio clips) locally on your device using local storage mechanisms.
                This data is not synced to the cloud or accessible by anyone else.
              </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                4. Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. You are advised to review this page periodically
                for any updates. Any changes will be posted directly to this page.
              </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                5. Contact Us
              </h2>
              <p>
                If you have any questions or suggestions regarding our Privacy Policy, please contact us at{' '}
                <a
                  href="mailto:[EMAIL_ADDRESS]"
                  style={{ color: 'var(--saffron)', textDecoration: 'underline' }}
                >
                  apps@theravado.com
                </a>
                .
              </p>
            </section>
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

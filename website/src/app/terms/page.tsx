import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'End User License Agreement & Terms of Service',
  description:
    'End User License Agreement (EULA) and Terms of Service for the IIT Calendar mobile application and website.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service & EULA — IIT Calendar',
    description:
      'End User License Agreement (EULA) and Terms of Service for IIT Calendar. Open-source, free, and privacy-first.',
    url: 'https://iit.damsak.org/terms',
  },
};

export default function TermsPage() {
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
              End User License Agreement
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Terms of Service · Last updated: June 2026
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
                1. Acceptance of Terms
              </h2>
              <p>
                By downloading, installing, accessing, or using the IIT Calendar application, you agree to
                be bound by the terms and conditions of this agreement. If you do not agree to these terms,
                do not install or use the application.
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
                2. License
              </h2>
              <p>
                This software is open-source. You may use it for personal, non-commercial purposes in
                accordance with its open-source license. The source code and content are freely available
                on GitHub for anyone to use, share, and adapt for non-commercial purposes.
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
                3. Disclaimer of Warranty
              </h2>
              <p>
                The application is provided &ldquo;AS IS&rdquo;, without warranty of any kind, express or implied,
                including but not limited to the warranties of merchantability, fitness for a particular
                purpose, and non-infringement. While every effort is made to ensure accurate astronomical
                and calendar calculations, the developers and publishers make no guarantees regarding accuracy
                under all regional conditions.
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
                4. Limitation of Liability
              </h2>
              <p>
                In no event shall the authors or copyright holders be liable for any claim, damages, or other
                liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in
                connection with the software or the use or other dealings in the software.
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
                5. Contact Information
              </h2>
              <p>
                If you have questions regarding this End User License Agreement or the Terms of Service,
                please contact us at{' '}
                <a
                  href="mailto:apps@theravado.com"
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

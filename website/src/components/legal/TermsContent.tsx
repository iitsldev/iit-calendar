import React from 'react';

export function TermsContent() {
  return (
    <div className="space-y-6">
      <p className="leading-relaxed">
        Welcome, and thank you for your interest in Sati (&ldquo;Sati&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the <strong>Sati</strong> mobile application
        (the &ldquo;App&rdquo;), our application website at{' '}
        <a href="https://sati.theravado.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent,#92400e)] underline">
          https://sati.theravado.com/
        </a>, and our organization website at{' '}
        <a href="https://theravado.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent,#92400e)] underline">
          https://theravado.com/
        </a>{' '}
        (collectively, the &ldquo;Services&rdquo;), provided by the legal entity <strong>International Institute of Theravada</strong>.
      </p>

      <p className="leading-relaxed">
        By downloading, installing, accessing, or using our Services, you agree to be bound by these Terms.
        If you do not agree to these Terms, please do not use the App or Website.
      </p>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          1. Nature of the Service & Free Dāna Software
        </h2>
        <p className="leading-relaxed">
          Sati is developed and distributed entirely free of charge as an act of <em>Dāna</em> (generous giving)
          for the benefit of the Dhamma community, Buddhist monastics, and lay practitioners worldwide.
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Free of Charge:</strong> All features, texts, calculators, chanting guides, and timers are accessible freely without paywalls, fees, or hidden charges.</li>
          <li><strong>No Advertising:</strong> Sati does not host commercial advertisements, affiliate promotions, or sponsored content.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          2. Open-Source License & Intellectual Property
        </h2>
        <p className="leading-relaxed">
          The source code of the Sati application is open-source and freely available on GitHub at{' '}
          <a
            href="https://github.com/iitsldev/iit-calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent,#92400e)] underline"
          >
            https://github.com/iitsldev/iit-calendar
          </a>{' '}
          under open-source licensing terms (Creative Commons Attribution-NonCommercial 4.0 International / CC-BY-NC-4.0).
        </p>
        <p className="leading-relaxed">
          You are encouraged to inspect, study, adapt, and share the code for personal, non-commercial, and religious educational purposes, provided attribution is maintained in accordance with the license. Commercial exploitation or sale of the application and its content is strictly prohibited.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          3. Privacy & Data Protection
        </h2>
        <p className="leading-relaxed">
          We hold privacy as a core principle. Sati is built offline-first: we do not collect personal data, track user behavior, or transmit user activity to remote servers. All astronomical calculations (such as sunrise and solar noon) are processed locally on your device. Please review our Privacy Policy for full details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          4. Astronomical Calculations & Disclaimer of Warranty
        </h2>
        <p className="leading-relaxed">
          Sati computes astronomical events for Buddhist Vinaya observances—such as dawn (<em>Aruṇuggamana</em>) and solar noon (<em>Majjhanhike</em>)—as well as Uposatha moon phases using mathematical and astronomical models (Meeus formulas).
        </p>
        <p className="leading-relaxed">
          The application and its content are provided on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis, without warranty of any kind, whether express, implied, or statutory. While every reasonable effort is made to ensure scientific and calendrical accuracy:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>We do not guarantee that astronomical calculations will be absolutely uninterrupted, error-free, or compliant with every regional monastic convention.</li>
          <li>Monastics and practitioners are advised to exercise personal discernment and observe local monastic traditions where geographical or atmospheric conditions differ.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          5. Limitation of Liability
        </h2>
        <p className="leading-relaxed">
          To the fullest extent permitted by applicable law, International Institute of Theravada, its monastics, directors, contributors, volunteers, and developers shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, or any loss of data, use, goodwill, or other intangible losses arising from or relating to your use of or inability to use the Services.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          6. Changes to These Terms
        </h2>
        <p className="leading-relaxed">
          We reserve the right to revise or update these Terms at any time to reflect software improvements, regulatory changes, or legal updates. Any revisions will be published with an updated effective date. Your continued use of the application after changes are posted constitutes your acceptance of the revised Terms.
        </p>
      </section>

      <section className="space-y-2 pb-4">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          7. Legal Entity & Contact Information
        </h2>
        <p className="leading-relaxed">
          Unless otherwise indicated, <strong>International Institute of Theravada</strong> is the legal entity and developer responsible for the Sati application and services.
        </p>
        <p className="leading-relaxed">
          If you have any questions, feedback, or concerns regarding these Terms of Service, please contact us:
        </p>
        <div className="leading-relaxed pt-1">
          <strong className="block">International Institute of Theravada</strong>
          <div>
            App Website:{' '}
            <a href="https://sati.theravado.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent,#92400e)] underline">
              https://sati.theravado.com/
            </a>
          </div>
          <div>
            Organization Website:{' '}
            <a href="https://theravado.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent,#92400e)] underline">
              https://theravado.com/
            </a>
          </div>
          <div>
            Email:{' '}
            <a href="mailto:apps@theravado.com" className="text-[var(--accent,#92400e)] underline">
              apps@theravado.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}


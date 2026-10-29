import React from 'react';

export function PrivacyContent() {
  return (
    <div className="space-y-6">
      <p className="leading-relaxed">
        Welcome, and thank you for your interest in Sati (&ldquo;Sati&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
        This Privacy Policy explains how the legal entity <strong>International Institute of Theravada</strong> collects, uses,
        and protects information in connection with the <strong>Sati</strong> mobile application
        (the &ldquo;App&rdquo;), our application website at{' '}
        <a href="https://sati.theravado.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent,#92400e)] underline">
          https://sati.theravado.com/
        </a>, and our organization website at{' '}
        <a href="https://theravado.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent,#92400e)] underline">
          https://theravado.com/
        </a>.
      </p>

      <p className="leading-relaxed">
        Sati is designed as an offline-first, reverent companion application for Buddhist monastics and lay practitioners.
        It provides astronomical solar calculations for Vinaya observance, multi-tradition Uposatha tracking, multi-script
        Pāli chanting, and meditation timers. We are deeply committed to user privacy, data minimization, and transparency.
      </p>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          1. Personal Information We Do Not Collect
        </h2>
        <p className="leading-relaxed">
          We believe that spiritual practice should remain completely private. <strong>We do not collect, store, transmit, or monetize any personal information.</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>No Account Registration:</strong> You are not required to create an account, register an email address, or provide any personal details to use the App.</li>
          <li><strong>No Analytics or Tracking:</strong> We do not use third-party analytics platforms, user tracking tools, behavioral profiling, or advertising networks.</li>
          <li><strong>No Cloud Syncing of Personal Activity:</strong> Your meditation sessions, chant bookmarks, notes, and usage history remain strictly on your device.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          2. Device Permissions and On-Device Processing
        </h2>
        <p className="leading-relaxed">
          The App requests access to certain device features solely to provide essential offline features:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Location Data:</strong> To determine accurate sun times (such as dawn <em>Aruṇuggamana</em> and solar noon <em>Majjhanhike</em>)
            essential for monastic Vinaya meal rules, Sati may request access to your device&rsquo;s location coordinates (latitude and longitude).
            <strong> All astronomical calculations are performed entirely locally on your device</strong> using client-side algorithms.
            Your location coordinates are never sent to external servers or shared with any third party.
          </li>
          <li>
            <strong>Notifications:</strong> If enabled, notification permissions are used solely to trigger on-device reminders (such as dawn alerts or meditation timer bells). The App does not send or receive remote push notifications.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          3. Local Storage and Data Retention
        </h2>
        <p className="leading-relaxed">
          All application preferences, selected tradition settings, chanting audio downloads, and study texts are stored locally on your device using standard sandboxed storage mechanisms (Local Storage and IndexedDB). This data is stored only on your hardware and is never synced to external servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          4. Data Deletion and Your Choices
        </h2>
        <p className="leading-relaxed">
          Because no personal information is collected or transmitted to external servers, International Institute of Theravada does not hold or retain any of your personal data on remote servers.
        </p>
        <p className="leading-relaxed">
          You maintain complete control over all data stored on your device:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>You can clear all stored preferences, bookmarks, and downloads at any time via your device settings (e.g., <em>Settings &gt; Apps &gt; Sati &gt; Storage &gt; Clear Data</em>).</li>
          <li>Uninstalling the App permanently removes all locally saved data from your device.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          5. Third-Party Services and Disclosures
        </h2>
        <p className="leading-relaxed">
          We do not sell, rent, trade, or disclose your information to any third parties. There are no advertising SDKs, commercial trackers, or third-party marketing tools embedded within the App or Website.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          6. Children&rsquo;s Privacy
        </h2>
        <p className="leading-relaxed">
          The App and Website are intended for general audiences of all ages, including children. We do not knowingly collect, request, or maintain any personal information from children or any other users.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          7. Changes to This Privacy Policy
        </h2>
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory updates. Any changes will be updated directly within this page.
        </p>
      </section>

      <section className="space-y-2 pb-4">
        <h2 className="font-serif text-xl font-bold text-[var(--text-primary,#1c1917)]">
          8. Contact Us
        </h2>
        <p className="leading-relaxed">
          Unless otherwise indicated, <strong>International Institute of Theravada</strong> is the legal entity and developer responsible for the processing of information described in this Policy.
        </p>
        <p className="leading-relaxed">
          If you have any questions, comments, or requests regarding this Privacy Policy or our practices, please contact us:
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


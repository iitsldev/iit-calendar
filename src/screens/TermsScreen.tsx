import React from 'react';
import { TermsContent } from '../components/legal/TermsContent';

export function TermsScreen() {
  return (
    <div className="h-screen overflow-y-auto scrollbar-hide p-6 md:p-8 bg-[var(--bg-main)] text-[var(--text-primary)]">
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <header className="border-b border-[var(--border-subtle)] pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Legal</p>
          <h1 className="font-serif text-3xl font-bold text-[var(--accent)] mb-1">Terms of Service</h1>
          <p className="text-sm text-[var(--text-secondary)]">Effective Date: October 29, 2026</p>
        </header>

        <div className="text-[var(--text-secondary)] leading-relaxed">
          <TermsContent />
        </div>
      </div>
    </div>
  );
}

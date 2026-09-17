import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms for using the independent Apex F1 archive and statistics service.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal / 03"
      title="Terms for using Apex."
      intro="By accessing Apex, you agree to use this independent service lawfully and responsibly. Apex is an informational archive, not an official timing, betting, safety, engineering or professional advice service."
      updated="17 September 2026"
      sections={[
        {
          title: 'Permitted use',
          body: (
            <p>
              You may browse, link to and quote reasonable portions of public
              editorial content with clear attribution. You may not scrape,
              overload, reverse engineer, impersonate Apex, bypass access controls
              or use the service for unlawful, abusive, misleading or commercial
              resale purposes without written permission.
            </p>
          ),
        },
        {
          title: 'Accuracy and availability',
          body: (
            <p>
              Data can be delayed, unavailable or corrected. Do not rely on Apex
              for decisions involving safety, wagering, finance or contractual
              obligations. We may change, suspend or remove content and features
              when needed for security, maintenance, source corrections or legal
              compliance.
            </p>
          ),
        },
        {
          title: 'Content and reports',
          body: (
            <p>
              Community or source material must respect copyright, privacy,
              publicity and trade-mark rights. To report an unlawful, inaccurate
              or infringing item, contact{' '}
              <a className="text-text-hi underline decoration-accent underline-offset-4" href="mailto:contact@apexstats.example">
                contact@apexstats.example
              </a>
              . We review good-faith reports and may request supporting details.
            </p>
          ),
        },
        {
          title: 'Disclaimer of warranties',
          body: (
            <p>
              To the extent permitted by law, Apex is provided “as is” without
              guarantees of uninterrupted availability, completeness, suitability
              or error-free data. Nothing here limits rights that cannot lawfully
              be excluded under applicable consumer or data-protection law.
            </p>
          ),
        },
      ]}
    />
  );
}

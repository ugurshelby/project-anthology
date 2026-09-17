import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Copyright & DMCA',
  description: 'Copyright notice and takedown process for Apex.',
  alternates: { canonical: '/dmca' },
};

export default function DmcaPage() {
  return (
    <LegalPage
      eyebrow="Legal / 04"
      title="Copyright and takedown requests."
      intro="Apex respects copyright and wants every asset to have a documented source and licence. If you believe content on this site infringes your rights, send a complete notice so we can investigate and act quickly."
      updated="17 September 2026"
      sections={[
        {
          title: 'What to include',
          body: (
            <ol className="list-decimal space-y-2 pl-5">
              <li>Your name, contact details and authority to act for the rights holder.</li>
              <li>A description of the copyrighted work and the exact Apex URL or asset path.</li>
              <li>A good-faith statement that the use is not authorised by the rights holder, its agent or law.</li>
              <li>A statement that the information is accurate and, where applicable, a signature.</li>
            </ol>
          ),
        },
        {
          title: 'Where to send it',
          body: (
            <p>
              Email the notice to{' '}
              <a className="text-text-hi underline decoration-accent underline-offset-4" href="mailto:dmca@apexstats.example">
                dmca@apexstats.example
              </a>
              . This address is a pre-launch placeholder and must be replaced by
              a monitored designated agent address before the service is publicly
              launched.
            </p>
          ),
        },
        {
          title: 'Review process',
          body: (
            <p>
              We acknowledge valid notices, preserve relevant records, restrict or
              remove the reported material while investigating, and contact the
              submitting party if clarification is needed. Counter-notices and
              repeat-infringer decisions are handled under applicable law. A
              mistaken or abusive notice can cause harm, so provide only
              truthful, specific information.
            </p>
          ),
        },
      ]}
    />
  );
}

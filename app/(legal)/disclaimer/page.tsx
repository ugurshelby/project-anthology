import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Unofficial Disclaimer',
  description: 'Apex is an independent, unofficial Formula 1 data and archive project.',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Legal / 01"
      title="Independent, unofficial and unaffiliated."
      intro="Apex is an independent statistics, telemetry and editorial archive project for motorsport fans. It is not an official Formula 1 website and has no commercial, licensing, sponsorship or endorsement relationship with Formula 1, Formula One Licensing B.V., the FIA, any team, driver, circuit, sponsor or rights holder."
      updated="17 September 2026"
      sections={[
        {
          title: 'Trade marks and names',
          body: (
            <>
              <p>
                “Formula 1”, “F1”, “FORMULA ONE”, “FIA FORMULA ONE WORLD CHAMPIONSHIP”,
                “Grand Prix” and related marks belong to their respective owners,
                including Formula One Licensing B.V. References to these names,
                teams, drivers and circuits are made only for identification,
                commentary and historical context.
              </p>
              <p>
                Apex does not use official Formula 1 branding, team marks or sponsor
                marks as its own identity. A name appearing in a data record does not
                imply partnership, approval or affiliation.
              </p>
            </>
          ),
        },
        {
          title: 'Data, media and sources',
          body: (
            <>
              <p>
                Results and timing information are presented for informational
                purposes and may be delayed, incomplete or corrected. Source
                attribution is provided where applicable; source providers remain
                responsible for their own data and terms.
              </p>
              <p>
                Apex prefers original vector illustrations, silhouettes, circuit
                diagrams and assets with a documented permissive licence. No
                Getty, AFP, Reuters or other unlicensed press photography is
                intentionally commissioned or presented as Apex-owned media.
              </p>
            </>
          ),
        },
        {
          title: 'Questions or concerns',
          body: (
            <p>
              For a brand, attribution or affiliation concern, contact{' '}
              <a className="text-text-hi underline decoration-accent underline-offset-4" href="mailto:contact@apexstats.example">
                contact@apexstats.example
              </a>
              . This address must be replaced with a monitored production mailbox
              before public launch.
            </p>
          ),
        },
      ]}
    />
  );
}

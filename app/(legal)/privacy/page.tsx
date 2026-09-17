import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Apex handles telemetry, analytics, cookies and privacy rights.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal / 02"
      title="Privacy, explained without the small print."
      intro="This policy describes how Apex handles the limited information needed to operate a fast, reliable statistics and archive service. It is written for Turkish users under KVKK and for users in the European Economic Area under GDPR. It is not a substitute for advice from your legal counsel."
      updated="17 September 2026"
      sections={[
        {
          title: 'What we collect',
          body: (
            <>
              <p>
                Apex may process technical request data such as a truncated IP
                address, browser/device type, language, approximate region,
                requested route, referrer and timestamp for security, reliability
                and aggregate performance measurement. We do not intentionally
                collect precise location, biometric data, payment data or sensitive
                personal data.
              </p>
              <p>
                Optional analytics may record anonymous page views, performance
                signals and interaction events. Telemetry is aggregated and is not
                used to build an advertising profile.
              </p>
            </>
          ),
        },
        {
          title: 'Cookies and legal bases',
          body: (
            <>
              <p>
                Strictly necessary cookies or local storage may keep security,
                accessibility and consent preferences working. Optional analytics
                cookies are disabled until you give consent and can be withdrawn
                at any time. We do not sell personal data.
              </p>
              <p>
                Depending on the context, processing relies on legitimate interest
                for security and service operation, consent for optional analytics,
                and legal obligation where required. We retain data only as long
                as needed for the stated purpose, then aggregate or delete it
                according to our retention schedule.
              </p>
            </>
          ),
        },
        {
          title: 'Your rights',
          body: (
            <>
              <p>
                Subject to applicable law, you may request access, correction,
                deletion, restriction, portability or objection; withdraw consent;
                and complain to the Turkish Data Protection Authority (KVKK) or
                your local supervisory authority. We may need to verify a request
                before acting on it.
              </p>
              <p>
                Send privacy requests to{' '}
                <a className="text-text-hi underline decoration-accent underline-offset-4" href="mailto:privacy@apexstats.example">
                  privacy@apexstats.example
                </a>
                . This address must be replaced with a monitored production
                mailbox and a data controller address before launch.
              </p>
            </>
          ),
        },
        {
          title: 'Service providers and security',
          body: (
            <p>
              Hosting, database, monitoring and analytics providers process data
              only to provide their contracted service. We apply access controls,
              server-side secret handling, rate limits and retention limits. No
              online service can promise absolute security; suspected incidents
              should be reported promptly to the privacy contact.
            </p>
          ),
        },
      ]}
    />
  );
}

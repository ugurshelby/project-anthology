import { useTranslations } from 'next-intl';
import type { MediaAttribution } from '@/lib/media/read';

/**
 * Visible credit for a license-checked media image (CC BY / CC BY-SA require it
 * wherever the image is shown): '<label> <author / Wikimedia Commons, license> ↗'.
 * Works in server and client components. Renders nothing without credit text.
 */
export function MediaCredit({
  attribution,
  className = '',
}: {
  attribution: MediaAttribution | null | undefined;
  className?: string;
}) {
  const t = useTranslations('ui.media');
  if (!attribution?.text) return null;
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 text-[10px] leading-tight ${className}`}>
      <span className="shrink-0 font-mono uppercase tracking-wider text-text-low">
        {attribution.trademark ? t('markLabel') : t('photoLabel')}
      </span>
      <span className="truncate text-text-mid">{attribution.text}</span>
      {attribution.sourceUrl ? (
        <a
          href={attribution.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('sourceAria')}
          className="shrink-0 text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          ↗
        </a>
      ) : null}
    </span>
  );
}

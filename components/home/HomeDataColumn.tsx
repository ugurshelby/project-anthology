import Link from 'next/link';
import type { ReactNode } from 'react';
import { FlatStandingsList } from './FlatStandingsList';
import { NewsList } from '@/components/news/NewsList';
import type { DriverStandingRow } from '@/lib/f1/mrdata';
import type { NewsItem } from '@/lib/data/types';

/**
 * Split Cinema right column / Poster Dense content stack — standings + optional slot + wire.
 */
export function HomeDataColumn({
  standings,
  season,
  news,
  extra,
}: {
  standings: DriverStandingRow[];
  season: number;
  news: NewsItem[];
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="label-caps text-text-mid">Driver Standings</h2>
          <Link href="/season" className="label-caps text-accent">
            Full →
          </Link>
        </div>
        <FlatStandingsList rows={standings} season={season} />
      </section>

      {extra ? <section>{extra}</section> : null}

      <section>
        <NewsList items={news} heading="The Wire" />
      </section>
    </div>
  );
}

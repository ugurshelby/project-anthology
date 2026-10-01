/**
 * Story clustering — groups articles from different outlets that cover the
 * same real-world event. Pure (no I/O), deterministic, unit-tested.
 *
 * Deliberately NON-transitive: every candidate is compared with the cluster's
 * seed only. Chaining (A~B, B~C ⇒ A~C) merges a whole race weekend into one
 * blob — measured on the live feed, that happened with union-find.
 */

export interface ClusterInput {
  url: string;
  source: string;
  title: string;
  summary: string;
  publishedTs: number;
}

const STOP = new Set(
  ('with from that this have will been their about after into over more than also says said what when ' +
    'which while would could there they them then were your just like only some other most such very still ' +
    'even much many make made before during through against between under again further once here where ' +
    'these those being does doing having formula grand prix season race team driver drivers')
    .split(' '),
);

export const CLUSTER_WINDOW_MS = 48 * 60 * 60 * 1000;
const MIN_OVERLAP = 0.4; // shared / min(|a|,|b|)
const MIN_SHARED = 3; // …and at least this many distinctive tokens in common

export function tokens(a: ClusterInput): Set<string> {
  const text = `${a.title} ${a.summary.slice(0, 200)}`;
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP.has(w)),
  );
}

function similar(a: Set<string>, b: Set<string>): boolean {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared >= MIN_SHARED && shared / Math.min(a.size, b.size) >= MIN_OVERLAP;
}

/** Newest-first seeds; a cluster holds at most one article per outlet. */
export function clusterArticles<T extends ClusterInput>(
  items: T[],
  canMerge: (a: T, b: T) => boolean = () => true,
): T[][] {
  const sorted = [...items].sort((x, y) => y.publishedTs - x.publishedTs);
  const tok = sorted.map(tokens);
  const claimed = new Array<boolean>(sorted.length).fill(false);
  const clusters: T[][] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (claimed[i]) continue;
    claimed[i] = true;
    const cluster = [sorted[i]];
    for (let j = i + 1; j < sorted.length; j++) {
      if (claimed[j]) continue;
      if (cluster.some((c) => c.source === sorted[j].source)) continue;
      if (!canMerge(sorted[i], sorted[j])) continue;
      if (Math.abs(sorted[i].publishedTs - sorted[j].publishedTs) > CLUSTER_WINDOW_MS) continue;
      if (similar(tok[i], tok[j])) {
        cluster.push(sorted[j]);
        claimed[j] = true;
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

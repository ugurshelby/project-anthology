import type { ReactNode } from 'react';

/** Rich-text tag renderer for `<mail>address</mail>` in legal copy. */
export function mailTag(chunks: ReactNode) {
  const address = typeof chunks === 'string' ? chunks : Array.isArray(chunks) ? chunks.join('') : '';
  return (
    <a className="text-text-hi underline decoration-accent underline-offset-4" href={`mailto:${address}`}>
      {chunks}
    </a>
  );
}

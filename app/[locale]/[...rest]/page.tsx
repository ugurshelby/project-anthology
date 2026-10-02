import { notFound } from 'next/navigation';

/**
 * Catch-all so unknown URLs render the localized not-found page inside the
 * locale layout (a root not-found without a root layout fails in `next dev`).
 */
export default function CatchAllNotFound(): never {
  notFound();
}

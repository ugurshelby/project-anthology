import { BentoSkeleton } from '@/components/layout/BentoSkeleton';

export default function Loading() {
  return <BentoSkeleton heroSpan={0} cards={[6, 6, 12]} />;
}

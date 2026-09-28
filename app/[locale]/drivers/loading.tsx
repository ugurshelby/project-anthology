import { BentoSkeleton } from '@/components/layout/BentoSkeleton';

export default function Loading() {
  return <BentoSkeleton heroSpan={0} cards={[4, 4, 4, 4, 4, 4, 4, 4]} />;
}

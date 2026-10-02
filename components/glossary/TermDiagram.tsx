import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { GlossaryCategory, TermDiagramId } from '@/data/glossary/terms';

export const CATEGORY_SLUG_MAP: Record<GlossaryCategory, string> = {
  'Aerodynamics': 'aerodynamics',
  'Power Unit': 'power-unit',
  'Tyres': 'tyres',
  'Chassis': 'chassis',
  'Strategy': 'strategy',
  'Regulations': 'regulations',
};

export function TermDiagram({
  id,
  className = 'h-8 w-8',
}: {
  id: TermDiagramId;
  className?: string;
}) {
  const t = useTranslations('ui.glossary');
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <Image
        src={`/glossary-icons/diagrams/${id}.webp`}
        alt={t('cadSchematic', { name: id })}
        fill
        sizes="96px"
        unoptimized
        className="object-contain"
      />
    </div>
  );
}

export function CategoryDiagram({
  category,
  className = 'h-8 w-8',
}: {
  category: GlossaryCategory;
  className?: string;
}) {
  const t = useTranslations('ui.glossary');
  const slug = CATEGORY_SLUG_MAP[category] || 'aerodynamics';
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <Image
        src={`/glossary-icons/categories/${slug}.webp`}
        alt={t('cadBlueprintOf', { name: category })}
        fill
        sizes="96px"
        unoptimized
        className="object-contain"
      />
    </div>
  );
}

export function TyreCadDiagram({
  type,
  className = 'h-8 w-8',
}: {
  type: 'slick' | 'intermediate' | 'wet';
  className?: string;
}) {
  const t = useTranslations('ui.glossary');
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <Image
        src={`/glossary-icons/tyres/${type}.webp`}
        alt={t('cadTyre', { name: type })}
        fill
        sizes="96px"
        unoptimized
        className="object-contain"
      />
    </div>
  );
}


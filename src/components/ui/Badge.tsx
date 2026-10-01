import type { DietaryTag } from '@/lib/types';

interface DietaryBadgeProps {
  tag: DietaryTag;
  size?: 'sm' | 'md';
}

const tagColors: Record<string, string> = {
  'Gluten-Free': 'bg-warm-100 text-warm-700 border-warm-200',
  'Vegan': 'bg-mint-100 text-mint-700 border-mint-200',
  'Nut-Free': 'bg-rose-100 text-rose-700 border-rose-200',
  'Dairy-Free': 'bg-sky-100 text-sky-700 border-sky-200',
  'Vegetarian': 'bg-mint-100 text-mint-600 border-mint-200',
};

export function DietaryBadge({ tag, size = 'md' }: DietaryBadgeProps) {
  const color = tagColors[tag] || 'bg-cream-100 text-warm-600 border-cream-200';
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`badge border ${color} ${padding}`}>
      {tag}
    </span>
  );
}

interface StatusBadgeProps {
  label: string;
  color: string;
}

const statusColorMap: Record<string, string> = {
  mint: 'bg-mint-100 text-mint-700 border-mint-300',
  lavender: 'bg-lavender-100 text-lavender-700 border-lavender-300',
  warm: 'bg-warm-100 text-warm-700 border-warm-300',
  rose: 'bg-rose-100 text-rose-700 border-rose-300',
  sky: 'bg-sky-100 text-sky-700 border-sky-300',
};

export function StatusBadge({ label, color }: StatusBadgeProps) {
  const colorClass = statusColorMap[color] || statusColorMap.lavender;
  return (
    <span className={`badge border ${colorClass} px-3 py-1`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </span>
  );
}

import { useMemo } from 'react';

interface FloatingPawsProps {
  count?: number;
  color?: 'rose' | 'mint';
}

export default function FloatingPaws({ count = 8, color = 'rose' }: FloatingPawsProps) {
  const paws = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = (i * 100) / count + Math.random() * 10;
      const delay = Math.random() * 4;
      const duration = 3 + Math.random() * 4;
      const size = 16 + Math.random() * 20;
      return { id: i, left, delay, duration, size };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {paws.map((paw) => (
        <div
          key={paw.id}
          className={`absolute bottom-0 ${color === 'rose' ? 'text-rose-200' : 'text-mint-200'} opacity-30`}
          style={{
            left: `${paw.left}%`,
            animation: `float ${paw.duration}s ease-in-out ${paw.delay}s infinite`,
          }}
        >
          <PawPrint size={paw.size} />
        </div>
      ))}
    </div>
  );
}

function PawPrint({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="50" rx="14" ry="11" />
      <circle cx="26" cy="32" r="6" />
      <circle cx="54" cy="32" r="6" />
      <circle cx="18" cy="46" r="5" />
      <circle cx="62" cy="46" r="5" />
    </svg>
  );
}

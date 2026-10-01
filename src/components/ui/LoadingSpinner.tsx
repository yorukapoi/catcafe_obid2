import { Cat } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center animate-bounceEar">
        <Cat className="w-8 h-8 text-rose-400" />
      </div>
      <p className="text-warm-500 font-medium text-sm">{label}</p>
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-rose-300"
          style={{ animation: `pulseSoft 1s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

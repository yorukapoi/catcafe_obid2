import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', onEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-warm-700/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div
        className={`relative ${maxWidth} w-full max-h-[90vh] overflow-y-auto bg-cream-50 rounded-4xl shadow-2xl animate-scaleIn scrollbar-hide`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-warm-500 hover:bg-rose-100 hover:text-rose-500 transition-colors shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

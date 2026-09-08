import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'lg';
}

const modalWidthClass = {
  default: 'max-w-[500px]',
  lg: 'max-w-[720px]',
} as const;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'default',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto bg-brand-dark/80 backdrop-blur-md animate-fade-in"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-3 sm:p-6 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div
          className={`w-full ${modalWidthClass[size]} bg-brand-card border border-brand-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] sm:max-h-[calc(100dvh-3rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))]`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="sticky top-0 z-10 flex shrink-0 justify-between items-center px-4 sm:px-6 py-4 border-b border-brand-border gap-3 bg-brand-card">
            <h3
              id="modal-title"
              className="text-base font-bold text-text-primary truncate min-w-0"
            >
              {title}
            </h3>
            <button
              type="button"
              className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:bg-brand-border hover:text-text-primary shrink-0"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto min-h-0 flex-1 overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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

  return (
    <div 
      className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md flex justify-center items-center z-[1000] p-6 animate-fade-in" 
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-[500px] bg-brand-card border border-brand-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-brand-border">
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <button 
            className="bg-transparent border-none text-text-muted cursor-pointer flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:bg-brand-border hover:text-text-primary" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;

import type { ReactNode } from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-panel py-16 px-6 flex flex-col items-center justify-center text-center gap-4 max-w-[500px] mx-auto w-full mt-4">
      <div className="w-16 h-16 rounded-full bg-brand-dark flex items-center justify-center border border-brand-border text-text-muted">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary max-w-[340px]">{description}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="cursor-pointer font-bold text-[11px] uppercase tracking-wider mt-2 py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none transition-all hover:bg-accent-primary-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

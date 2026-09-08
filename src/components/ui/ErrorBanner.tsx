import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  error: string;
  onRetry: () => void;
  title?: string;
  retryLabel?: string;
  variant?: 'default' | 'compact';
}

export function ErrorBanner({
  error,
  onRetry,
  title = 'API Connection Error',
  retryLabel = 'Retry Connection',
  variant = 'default',
}: ErrorBannerProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-accent-danger/10 text-accent-danger border border-accent-danger/20 p-3 rounded-md text-xs font-medium flex items-center gap-2">
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 border-accent-danger/25 bg-accent-danger/5 flex items-center gap-3 text-accent-danger max-w-[600px] mx-auto w-full">
      <AlertCircle size={20} />
      <div className="flex flex-col">
        <span className="text-xs font-semibold">{title}</span>
        <span className="text-[11px] text-accent-danger/80 mt-0.5">{error}</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="ml-auto cursor-pointer font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 bg-accent-danger/10 border border-accent-danger/20 rounded hover:bg-accent-danger/20 transition-all text-accent-danger"
      >
        {retryLabel}
      </button>
    </div>
  );
}

export default ErrorBanner;

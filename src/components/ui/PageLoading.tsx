import { Loader2 } from 'lucide-react';

interface PageLoadingProps {
  message?: string;
  variant?: 'page' | 'inline';
}

export function PageLoading({
  message = 'Loading...',
  variant = 'page',
}: PageLoadingProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-text-muted text-sm">
        <Loader2 size={18} className="animate-spin" />
        {message}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin text-accent-primary" size={32} />
      <span className="text-xs text-text-muted font-medium">{message}</span>
    </div>
  );
}

export default PageLoading;

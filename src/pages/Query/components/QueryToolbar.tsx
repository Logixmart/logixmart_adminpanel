import { Download, Loader2 } from 'lucide-react';

interface QueryToolbarProps {
  total: number;
  canExport: boolean;
  isExporting: boolean;
  onExport: () => void;
}

export function QueryToolbar({
  total,
  canExport,
  isExporting,
  onExport,
}: QueryToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      {canExport && (
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-brand-border bg-brand-card/80 text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-accent-primary/30 disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          Download Excel
        </button>
      )}
      <span className="text-xs text-text-secondary font-semibold">{total} total</span>
    </div>
  );
}

export default QueryToolbar;

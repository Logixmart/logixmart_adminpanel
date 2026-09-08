import { Eye, Trash2 } from 'lucide-react';
import type { ContactSubmission } from '../../../api/contact';
import { formatDate } from '../../../utils/format';
import { QUERY_TABLE_HEADERS } from '../utils/queryHelpers';

interface QueryTableProps {
  queries: ContactSubmission[];
  onView: (query: ContactSubmission) => void;
  onDelete: (query: ContactSubmission) => void;
}

export function QueryTable({ queries, onView, onDelete }: QueryTableProps) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[860px]">
          <thead>
            <tr className="border-b border-brand-border bg-brand-dark/40">
              {QUERY_TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queries.map((query) => (
              <tr
                key={query.id}
                className="border-b border-brand-border/60 hover:bg-brand-hover/50 transition-colors"
              >
                <td className="px-4 py-3.5 text-[13px] font-semibold text-text-primary">
                  {query.name}
                </td>
                <td className="px-4 py-3.5 text-xs text-text-secondary">{query.email}</td>
                <td className="px-4 py-3.5 text-xs text-text-secondary">
                  {query.phone || '—'}
                </td>
                <td className="px-4 py-3.5 text-xs text-text-secondary max-w-[160px] truncate">
                  {query.subject || '—'}
                </td>
                <td className="px-4 py-3.5 text-xs text-text-secondary max-w-[220px] truncate">
                  {query.message}
                </td>
                <td className="px-4 py-3.5 text-xs text-text-secondary whitespace-nowrap">
                  {formatDate(query.createdAt)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(query)}
                      className="cursor-pointer font-semibold text-[11px] py-1.5 px-2.5 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center gap-1.5 transition-all"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(query)}
                      className="cursor-pointer p-1.5 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
                      title="Delete query"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QueryTable;

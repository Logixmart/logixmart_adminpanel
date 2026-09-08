import { ArrowUpDown } from 'lucide-react';
import type { BlogSortBy } from '../utils/blogHelpers';

interface BlogSortSelectProps {
  value: BlogSortBy;
  onChange: (value: BlogSortBy) => void;
}

export function BlogSortSelect({ value, onChange }: BlogSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown size={14} className="text-text-muted" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BlogSortBy)}
        className="bg-brand-dark/50 border border-brand-border rounded-lg py-2 px-3 text-xs text-text-secondary outline-none cursor-pointer hover:border-brand-border-hover transition-colors"
      >
        <option value="newest">Sort: Newest First</option>
        <option value="oldest">Sort: Oldest First</option>
        <option value="title">Sort: Alphabetical</option>
      </select>
    </div>
  );
}

export default BlogSortSelect;

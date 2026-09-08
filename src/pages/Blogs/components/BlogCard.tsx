import { Calendar, Edit3, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { Blog } from '../../../api/blogs';
import { resolveMediaUrl } from '../../../api/http';
import { formatDate } from '../../../utils/format';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';

interface BlogCardProps {
  blog: Blog;
  onViewImage: (imageUrl: string, title: string) => void;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export function BlogCard({ blog, onViewImage, onEdit, onDelete }: BlogCardProps) {
  const fullImageUrl = blog.imageUrl ? resolveMediaUrl(blog.imageUrl) : null;

  return (
    <div className="group relative bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-brand-border-hover hover:shadow-xl hover:shadow-accent-primary-glow">
      <div className="h-44 w-full bg-brand-dark relative overflow-hidden border-b border-brand-border">
        {fullImageUrl ? (
          <button
            type="button"
            onClick={() => onViewImage(fullImageUrl, blog.title)}
            className="w-full h-full p-0 border-none bg-transparent cursor-pointer block"
            title="View image"
          >
            <img
              src={fullImageUrl}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
          </button>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <ImageIcon size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60 pointer-events-none" />
        <span className="absolute bottom-3 left-4 text-[10px] font-semibold bg-brand-dark/80 backdrop-blur border border-brand-border py-1 px-2.5 rounded-md text-text-primary flex items-center gap-1.5 shadow-sm">
          <Calendar size={11} className="text-accent-primary" />
          {formatDate(blog.createdAt)}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-2.5">
        <h3 className="font-bold text-text-primary text-[14.5px] leading-snug group-hover:text-accent-primary transition-colors duration-200 line-clamp-1">
          {blog.title}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 flex-1">
          {blog.description}
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-brand-border mt-2">
          <button
            type="button"
            onClick={() => onEdit(blog)}
            className="flex-1 cursor-pointer font-semibold text-[11px] py-2 px-3 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Edit3 size={12} /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(blog)}
            className="cursor-pointer p-2 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger hover:text-white rounded-md flex items-center justify-center transition-all"
            title="Delete Article"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;

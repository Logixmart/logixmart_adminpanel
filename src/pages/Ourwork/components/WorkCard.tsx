import {
  Calendar,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import type { Work } from '../../../api/work';
import { formatDate } from '../../../utils/format';
import type { WorkWithImages } from '../utils/workHelpers';

interface WorkCardProps {
  item: WorkWithImages;
  onViewImages: (urls: string[], startIndex: number, title: string) => void;
  onEdit: (work: Work) => void;
  onDelete: (work: Work) => void;
}

export function WorkCard({
  item,
  onViewImages,
  onEdit,
  onDelete,
}: WorkCardProps) {
  const { work, images } = item;
  const urls = images.map((img) => img.url);
  const cover = urls[0];

  return (
    <div className="group relative bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-brand-border-hover hover:shadow-xl hover:shadow-accent-primary-glow">
      <div className="h-44 w-full bg-brand-dark relative overflow-hidden border-b border-brand-border">
        {cover ? (
          <button
            type="button"
            onClick={() => onViewImages(urls, 0, work.title)}
            className="w-full h-full p-0 border-none bg-transparent cursor-pointer block"
            title="View images"
          >
            <img
              src={cover}
              alt={work.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <ImageIcon size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60 pointer-events-none" />
        <span className="absolute bottom-3 left-4 text-[10px] font-semibold bg-brand-dark/80 backdrop-blur border border-brand-border py-1 px-2.5 rounded-md text-text-primary flex items-center gap-1.5 shadow-sm pointer-events-none">
          <Calendar size={11} className="text-accent-primary" />
          {formatDate(work.createdAt)}
        </span>
        {images.length > 0 && (
          <button
            type="button"
            onClick={() => onViewImages(urls, 0, work.title)}
            className="absolute bottom-3 right-4 text-[10px] font-semibold bg-brand-dark/80 backdrop-blur border border-brand-border py-1 px-2.5 rounded-md text-text-primary flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ImageIcon size={11} className="text-accent-primary" />
            {images.length}
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b border-brand-border bg-brand-dark/30">
          {images.map((img, imgIndex) => (
            <button
              key={img.key}
              type="button"
              onClick={() => onViewImages(urls, imgIndex, work.title)}
              className="w-10 h-10 rounded-md overflow-hidden border border-brand-border p-0 cursor-pointer shrink-0 hover:border-accent-primary/50 transition-colors"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col gap-2.5">
        <h3 className="font-bold text-text-primary text-[14.5px] leading-snug group-hover:text-accent-primary transition-colors duration-200 line-clamp-1">
          {work.title}
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 flex-1">
          {work.description}
        </p>

        {(work.websiteUrl || work.appStoreUrl || work.playStoreUrl) && (
          <div className="flex flex-wrap gap-2">
            {work.websiteUrl && (
              <a
                href={work.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-semibold text-accent-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink size={11} /> Website
              </a>
            )}
            {work.appStoreUrl && (
              <a
                href={work.appStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-semibold text-accent-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink size={11} /> App Store
              </a>
            )}
            {work.playStoreUrl && (
              <a
                href={work.playStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-semibold text-accent-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink size={11} /> Play Store
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-brand-border mt-1">
          <button
            onClick={() => onEdit(work)}
            className="flex-1 cursor-pointer font-semibold text-[11px] py-2 px-3 border border-brand-border hover:border-brand-border-hover bg-brand-dark/40 hover:bg-brand-hover text-text-secondary hover:text-text-primary rounded-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Edit3 size={12} /> Edit
          </button>
          <button
            onClick={() => onDelete(work)}
            className="cursor-pointer p-2 bg-accent-danger/5 hover:bg-accent-danger/10 border border-accent-danger/10 hover:border-accent-danger/25 text-accent-danger rounded-md flex items-center justify-center transition-all"
            title="Delete Work"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkCard;

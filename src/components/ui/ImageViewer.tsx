import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  startIndex?: number;
  title?: string;
}

const SWIPE_THRESHOLD = 50;

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  images,
  startIndex = 0,
  title,
}) => {
  const [index, setIndex] = useState(startIndex);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const count = images.length;
  const canSlide = count > 1;

  const goPrev = useCallback(() => {
    setIndex((current) => (count === 0 ? current : (current - 1 + count) % count));
  }, [count]);

  const goNext = useCallback(() => {
    setIndex((current) => (count === 0 ? current : (current + 1) % count));
  }, [count]);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (isOpen) {
      setIndex(Math.min(Math.max(startIndex, 0), Math.max(count - 1, 0)));
      setDragX(0);
      setIsDragging(false);
    }
  }, [isOpen, startIndex, count]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, goPrev, goNext]);

  if (!isOpen || count === 0) return null;

  const finishSwipe = (delta: number) => {
    setIsDragging(false);
    setDragX(0);
    if (!canSlide) return;
    if (delta <= -SWIPE_THRESHOLD) goNext();
    if (delta >= SWIPE_THRESHOLD) goPrev();
  };

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-md flex flex-col animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col min-w-0">
          {title && (
            <h3 className="text-sm font-bold text-white truncate">{title}</h3>
          )}
          <span className="text-[11px] text-white/60 font-medium">
            {index + 1} / {count}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="bg-white/10 border-none text-white cursor-pointer flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close image viewer"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="flex-1 relative min-h-0 flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {canSlide && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 md:left-6 z-10 bg-white/10 hover:bg-white/20 border-none text-white cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        <div
          className="w-full h-full overflow-hidden"
          onTouchStart={(e) => {
            setTouchStartX(e.touches[0].clientX);
            setIsDragging(true);
          }}
          onTouchMove={(e) => {
            if (touchStartX === null) return;
            setDragX(e.touches[0].clientX - touchStartX);
          }}
          onTouchEnd={() => {
            finishSwipe(dragX);
            setTouchStartX(null);
          }}
          onMouseDown={(e) => {
            setTouchStartX(e.clientX);
            setIsDragging(true);
          }}
          onMouseMove={(e) => {
            if (touchStartX === null) return;
            setDragX(e.clientX - touchStartX);
          }}
          onMouseUp={() => {
            finishSwipe(dragX);
            setTouchStartX(null);
          }}
          onMouseLeave={() => {
            if (touchStartX === null) return;
            finishSwipe(dragX);
            setTouchStartX(null);
          }}
        >
          <div
            className={`flex h-full ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
            style={{
              transform: `translateX(calc(-${index * 100}% + ${isDragging ? dragX : 0}px))`,
            }}
          >
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="min-w-full h-full flex items-center justify-center px-12 md:px-20 select-none"
              >
                <img
                  src={src}
                  alt={title ? `${title} ${i + 1}` : `Image ${i + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {canSlide && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 md:right-6 z-10 bg-white/10 hover:bg-white/20 border-none text-white cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {canSlide && (
        <div
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={`dot-${src}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={`h-12 w-12 rounded-md overflow-hidden border-2 p-0 cursor-pointer transition-all ${
                i === index
                  ? 'border-white opacity-100 scale-105'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageViewer;

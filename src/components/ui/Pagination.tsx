interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="cursor-pointer text-xs py-2 px-3 rounded-md border border-brand-border text-text-secondary disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-xs text-text-muted">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="cursor-pointer text-xs py-2 px-3 rounded-md border border-brand-border text-text-secondary disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;

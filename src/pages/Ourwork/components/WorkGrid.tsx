import type { Work } from '../../../api/work';
import type { WorkWithImages } from '../utils/workHelpers';
import { WorkCard } from './WorkCard';

interface WorkGridProps {
  items: WorkWithImages[];
  onViewImages: (urls: string[], startIndex: number, title: string) => void;
  onEdit: (work: Work) => void;
  onDelete: (work: Work) => void;
}

export function WorkGrid({
  items,
  onViewImages,
  onEdit,
  onDelete,
}: WorkGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <WorkCard
          key={item.work.id}
          item={item}
          onViewImages={onViewImages}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default WorkGrid;

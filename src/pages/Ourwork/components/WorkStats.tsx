import { Briefcase, Calendar, Image as ImageIcon } from 'lucide-react';

interface WorkStatsProps {
  total: number;
  withImagesCount: number;
  latestUpdate: string;
}

export function WorkStats({
  total,
  withImagesCount,
  latestUpdate,
}: WorkStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <div className="glass-panel p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
          <Briefcase size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Total Projects
          </span>
          <span className="text-lg font-bold text-text-primary">{total}</span>
        </div>
      </div>

      <div className="glass-panel p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center text-accent-secondary border border-accent-secondary/20">
          <ImageIcon size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            With Images
          </span>
          <span className="text-lg font-bold text-text-primary">
            {withImagesCount}
          </span>
        </div>
      </div>

      <div className="glass-panel p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-accent-info/10 flex items-center justify-center text-accent-info border border-accent-info/20">
          <Calendar size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Latest Update
          </span>
          <span className="text-sm font-bold text-text-primary">
            {latestUpdate}
          </span>
        </div>
      </div>
    </div>
  );
}

export default WorkStats;

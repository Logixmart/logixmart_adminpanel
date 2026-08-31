import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface PageHeaderProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: PageHeaderAction;
  trailing?: ReactNode;
  size?: 'lg' | 'md' | 'sm';
  actionStyle?: 'default' | 'uppercase' | 'simple';
}

const wrapperClasses: Record<NonNullable<PageHeaderProps['size']>, string> = {
  lg: 'flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2',
  md: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
  sm: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4',
};

const titleClasses: Record<NonNullable<PageHeaderProps['size']>, string> = {
  lg: 'text-2xl font-bold tracking-tight text-text-primary',
  md: 'text-xl font-bold text-text-primary tracking-tight flex items-center gap-2',
  sm: 'text-lg font-bold text-text-primary tracking-tight flex items-center gap-2',
};

const actionClasses: Record<NonNullable<PageHeaderProps['actionStyle']>, string> = {
  default:
    'cursor-pointer font-semibold text-xs py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none flex items-center gap-2 transition-all duration-200 hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/20',
  uppercase:
    'cursor-pointer font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-lg bg-accent-primary text-white border-none transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-primary/25 flex items-center justify-center gap-2',
  simple:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-primary text-white text-xs font-semibold hover:bg-accent-primary-hover transition-colors',
};

const actionAlignClasses: Record<NonNullable<PageHeaderProps['size']>, string> = {
  lg: 'self-start md:self-auto',
  md: 'self-start sm:self-auto',
  sm: 'self-start sm:self-auto',
};

function PageHeaderActions({
  action,
  trailing,
  actionStyle = 'default',
  size = 'lg',
}: Pick<PageHeaderProps, 'action' | 'trailing' | 'actionStyle' | 'size'>) {
  return (
    <>
      {trailing}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`${actionClasses[actionStyle]} ${actionAlignClasses[size]}`}
        >
          {action.icon ?? <Plus size={16} />}
          {action.label}
        </button>
      )}
    </>
  );
}

export function PageHeader({
  title,
  description,
  icon,
  action,
  trailing,
  size = 'lg',
  actionStyle = 'default',
}: PageHeaderProps) {
  if (!title && !description) {
    if (!action && !trailing) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <PageHeaderActions
          action={action}
          trailing={trailing}
          actionStyle={actionStyle}
          size={size}
        />
      </div>
    );
  }

  const TitleTag = size === 'sm' ? 'h2' : 'h1';

  return (
    <div className={wrapperClasses[size]}>
      <div className="flex flex-col gap-1">
        <TitleTag className={titleClasses[size]}>
          {icon}
          {title}
        </TitleTag>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>

      <PageHeaderActions
        action={action}
        trailing={trailing}
        actionStyle={actionStyle}
        size={size}
      />
    </div>
  );
}

export default PageHeader;

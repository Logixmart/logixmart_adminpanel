interface SuccessBannerProps {
  message: string;
  variant?: 'default' | 'compact';
}

export function SuccessBanner({ message, variant = 'default' }: SuccessBannerProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 py-3 px-4 rounded-md text-xs font-semibold text-center">
        {message}
      </div>
    );
  }

  return (
    <div className="bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/25 py-3.5 px-5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-[600px] mx-auto w-full shadow-lg shadow-accent-secondary/5">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-ping" />
      {message}
    </div>
  );
}

export default SuccessBanner;

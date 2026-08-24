interface CompanyLogoProps {
  className?: string;
  alt?: string;
}

export function CompanyLogo({ className = 'w-full h-full', alt = 'Logixmart logo' }: CompanyLogoProps) {
  return (
    <img
      src="/company-logo.png"
      alt={alt}
      className={`company-logo object-contain ${className}`}
    />
  );
}

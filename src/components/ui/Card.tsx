type CardProps = {
  featured?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Card({ featured = false, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card shadow-card p-6 transition-all duration-base hover:shadow-card-hover hover:-translate-y-1 ${featured ? "border-2 border-brand-red" : "border border-border"} ${className}`}
    >
      {children}
    </div>
  );
}

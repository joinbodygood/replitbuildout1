type BadgeProps = {
  variant?: "red" | "pink" | "success" | "muted";
  children: React.ReactNode;
};

const badgeVariants = {
  red: "bg-brand-red text-white",
  pink: "bg-brand-pink text-brand-red",
  success: "bg-success-soft text-success",
  muted: "bg-surface-dim text-body-muted",
};

export function Badge({ variant = "pink", children }: BadgeProps) {
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold font-heading rounded-pill ${badgeVariants[variant]}`}>
      {children}
    </span>
  );
}

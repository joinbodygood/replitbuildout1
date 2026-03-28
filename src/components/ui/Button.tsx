import Link from "next/link";

type ButtonProps = {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variants = {
  primary:
    "bg-brand-red text-white shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover",
  secondary:
    "bg-brand-pink text-brand-red hover:bg-brand-pink-soft",
  outline:
    "border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white",
};

const sizes = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-8 py-3.5 text-base",
  lg: "px-10 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center font-heading font-semibold rounded-pill transition-all duration-base ${variants[variant]} ${sizes[size]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

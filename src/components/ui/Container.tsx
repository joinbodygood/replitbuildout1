type ContainerProps = {
  narrow?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Container({ narrow = false, children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto px-6 ${narrow ? "max-w-3xl" : "max-w-6xl"} ${className}`}>
      {children}
    </div>
  );
}

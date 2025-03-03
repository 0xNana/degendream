import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={cn("container mx-auto px-4 max-w-[1400px]", className)}>
      {children}
    </div>
  );
} 
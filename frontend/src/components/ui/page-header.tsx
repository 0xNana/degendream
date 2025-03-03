import { cn } from "@/lib/utils"
import { PageHeaderProps } from "@/types/ui"

export function PageHeader({ 
  title, 
  description, 
  variant = 'hero',
  align = 'center' 
}: PageHeaderProps) {
  return (
    <div className={cn(
      "max-w-2xl",
      align === 'center' ? 'mx-auto text-center' : '',
      "space-y-2"
    )}>
      <h1 className={cn(
        "font-bold",
        variant === 'hero' && "text-4xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text",
        variant === 'section' && "text-3xl",
        variant === 'subtitle' && "text-xl text-muted-foreground"
      )}>
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
} 
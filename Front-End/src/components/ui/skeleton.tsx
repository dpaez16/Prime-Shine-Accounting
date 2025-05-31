import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse h-4 bg-primary/15 rounded-sm col-span-1", className)}
      {...props}
    />
  )
}

export { Skeleton }

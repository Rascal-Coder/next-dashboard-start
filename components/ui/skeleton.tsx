import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted-foreground/10",
        "after:absolute after:inset-0 after:-translate-x-full",
        "after:animate-[shimmer_1.6s_ease-in-out_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent",
        "dark:after:via-white/10",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

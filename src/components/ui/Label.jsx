import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label" // I didn't install radix label, so I will just use a span/label element directly or install it. The prompt didn't say install radix. I will use standard label.
import { cn } from "../../lib/utils"

const Label = React.forwardRef(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/90",
            className
        )}
        {...props}
    />
))
Label.displayName = "Label"

export { Label }

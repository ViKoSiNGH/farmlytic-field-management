
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
  ({ className, type, ...props }, ref) => {
    // Additional props for numeric inputs
    const additionalProps: React.InputHTMLAttributes<HTMLInputElement> = type === "number" 
      ? { 
          // Remove default value behavior
          placeholder: " ",  // Use empty space to prevent browsers from showing 0
          style: { 
            appearance: "textfield"
          } 
        } 
      : {};

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Add specific class to remove spinner buttons from number inputs
          type === "number" ? "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" : "",
          className
        )}
        ref={ref}
        {...additionalProps}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

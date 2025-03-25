
import * as React from "react"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = (node: HTMLTextAreaElement) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Optimization to prevent excessive re-renders
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={combinedRef}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

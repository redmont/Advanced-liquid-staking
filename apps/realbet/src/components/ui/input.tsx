import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes & {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 has-[:focus-visible]:border-primary',
          className,
        )}
      >
        {startAdornment && <span>{startAdornment}</span>}
        <input
          type={type}
          className={cn(
            '[&::-webkit-outer-spin-button] h-9 w-full flex-1 bg-transparent px-3 py-1 text-sm [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none',
            'focus:border-none focus-visible:border-none', // Added classes to remove border on focus
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && <span className="ml-2">{endAdornment}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };

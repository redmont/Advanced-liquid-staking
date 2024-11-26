import * as React from 'react';
import { cn } from '@/lib/cn';
import { LoaderCircle } from 'lucide-react';

export type InputProps = {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      startAdornment,
      endAdornment,
      loading,
      error,
      size = 'md',
      align = 'left',
      ...props
    },
    ref,
  ) => {
    const alignmentClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[align];

    return (
      <div
        className={cn(
          'flex items-center rounded-md border border-input-border bg-transparent shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 has-[:focus-visible]:border-primary',
          className,
          { 'animate-pulse': loading },
          {
            'h-8': size === 'sm',
            'h-12': size === 'md',
            'h-16': size === 'lg',
          },
          error && 'border-destructive',
        )}
      >
        {startAdornment && (
          <>
            {loading ? (
              <LoaderCircle className="ml-2 animate-spin" />
            ) : (
              startAdornment
            )}
          </>
        )}
        {!startAdornment && loading && (
          <div className="ml-2">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            '[&::-webkit-outer-spin-button] w-full flex-1 bg-transparent px-3 py-1 text-input [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none',
            alignmentClass,
            loading && 'opacity-50',
            {
              'h-6 text-xs': size === 'sm',
              'h-8': size === 'md',
              'h-12 text-lg': size === 'lg',
            },
            error && 'text-destructive',
          )}
          ref={ref}
          disabled={loading}
          {...props}
        />
        {endAdornment && <span className="mx-2">{endAdornment}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };

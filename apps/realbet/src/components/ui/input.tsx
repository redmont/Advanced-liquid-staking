import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

// Add loading to the InputProps type
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  loading?: boolean; // new prop for loading state
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, startAdornment, endAdornment, loading, ...props },
    ref,
  ) => {
    return (
      <div
        className={cn(
          'flex items-center rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 has-[:focus-visible]:border-primary',
          className,
          { 'opacity-75': loading }, // lower the opacity to indicate loading state
        )}
      >
        {startAdornment && (
          <span>
            {loading ? (
              <LoaderCircle className="ml-2 animate-spin" />
            ) : (
              startAdornment
            )}
          </span>
        )}
        {!startAdornment && loading && (
          <span className="ml-2">
            <LoaderCircle className="animate-spin" />{' '}
          </span>
        )}
        <input
          type={type}
          className={cn(
            '[&::-webkit-outer-spin-button] h-9 w-full flex-1 bg-transparent px-3 py-1 text-sm text-input [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none',
            'focus:border-none focus-visible:border-none', // Added classes to remove border on focus
            loading && 'opacity-50', // lower the opacity to indicate loading state
          )}
          ref={ref}
          disabled={loading} // disable input when loading
          {...props}
        />
        {endAdornment && <span className="ml-2">{endAdornment}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };

'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Define the variants using cva
const progressVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full bg-lightest/20',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
      },
      variant: {
        primary: 'bg-primary/20',
        secondary: 'bg-secondary/20',
        lightest: 'bg-lightest/20',
        foreground: 'bg-foreground/20',
        accent: 'bg-accent/20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'foreground',
    },
  },
);

const indicatorVariants = cva('size-full flex-1 transition-all', {
  variants: {
    variant: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      lightest: 'bg-lightest',
      foreground: 'bg-foreground',
      accent: 'bg-accent',
    },
  },
  defaultVariants: {
    variant: 'lightest',
  },
});

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ size, variant }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={indicatorVariants({ variant })}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

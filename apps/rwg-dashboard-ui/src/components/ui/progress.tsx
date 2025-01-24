'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

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
        lightest: 'bg-lightest/20',
        foreground: 'bg-foreground/20',
        accent: 'bg-accent/20',
        teal: 'foreground',
        'accent-2': 'bg-accent-2/2',
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
      white: 'bg-white',
      primary: 'bg-primary',
      lighter: 'bg-lighter',
      lightest: 'bg-lightest',
      foreground: 'bg-foreground',
      accent: 'bg-accent',
      teal: 'bg-teal-500',
      'accent-2': 'bg-accent-2',
    },
  },
  defaultVariants: {
    variant: 'lightest',
  },
});

export interface IndicatorProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Indicator>,
    VariantProps<typeof indicatorVariants> {
  value?: number;
}

const Indicator = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Indicator>,
  IndicatorProps
>(({ className, value, variant, ...props }, ref) => (
  <ProgressPrimitive.Indicator
    ref={ref}
    className={cn(
      'flex items-center justify-center',
      indicatorVariants({ variant }),
      className,
    )}
    style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    {...props}
  />
));

Indicator.displayName = ProgressPrimitive.Indicator.displayName;

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
    {props.children ?? (
      <Indicator
        variant={variant}
        value={value}
        className={indicatorVariants({ variant })}
      />
    )}
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, Indicator };

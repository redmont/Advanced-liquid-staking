import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  skeleton?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, skeleton, loading = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-3xl bg-card text-card-foreground shadow',
        className,
      )}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 z-10 animate-skeleton bg-light">
          {skeleton}
        </div>
      )}
      {props.children}
    </div>
  ),
);
Card.displayName = 'Card';

// CardHeader component
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// CardTitle component
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// CardDescription component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// CardContent component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  skeleton?: React.ReactNode;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, loading = false, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props}>
      <div className="relative">
        {loading && (
          <Skeleton className="absolute inset-0 z-10 animate-skeleton" />
        )}
        {props.children}
      </div>
    </div>
  ),
);
CardContent.displayName = 'CardContent';

// CardFooter component
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

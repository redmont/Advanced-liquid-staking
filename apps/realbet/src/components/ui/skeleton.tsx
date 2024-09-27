import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

const skeletonVariants = cva('rounded-2xl animate-pulse', {
  variants: {
    variant: {
      default: 'bg-lighter',
      primary: 'bg-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function Skeleton({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'primary' }) {
  return (
    <span
      className={cn('block', skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton };

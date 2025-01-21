import { cva } from 'class-variance-authority';
import Icon from '@/assets/images/R.svg';

type Props = {
  border?: boolean;
  size?: 'lg' | 'md';
};

const iconClass = cva(
  'ml-2 mt-1 inline-flex flex-col items-center justify-center rounded-full bg-black text-primary',
  {
    variants: {
      border: {
        true: 'border-2 border-primary',
        false: 'border-2 border-black',
      },
      size: {
        lg: 'size-12 p-1.5',
        md: 'size-8 p-1',
      },
    },
    defaultVariants: {
      border: true,
      size: 'md',
    },
  },
);

export default function RealIcon({ border, size }: Props) {
  return (
    <span className={iconClass({ border, size })}>
      <Icon className="size-full" />
    </span>
  );
}

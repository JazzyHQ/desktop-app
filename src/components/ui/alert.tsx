import { InformationCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '~/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof alertVariants> {
  // eslint-disable-next-line react/require-default-props
  iconClassName?: string;
}

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & AlertProps
>(({ className, iconClassName, variant, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {variant === 'destructive' ? (
      <XCircleIcon className={cn('h-4 w-4 text-red-400', iconClassName)} />
    ) : (
      <InformationCircleIcon className={cn('h-4 w-4', iconClassName)} />
    )}
    {children}
  </div>
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };

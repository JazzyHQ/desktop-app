import { DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';

import { Dialog, DialogContent } from '~/components/ui/dialog';
import { cn } from '~/lib/utils';

interface FooterProps {
  // eslint-disable-next-line react/require-default-props
  footerElement?: React.ReactNode;
  // eslint-disable-next-line react/require-default-props
  footerClassName?: string;
}

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive> & FooterProps
  // eslint-disable-next-line react/prop-types
>(({ className, children, footerElement, footerClassName, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    {children}

    {footerElement && (
      <div
        className={cn(
          'flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700',
          footerClassName
        )}
      >
        {footerElement}
      </div>
    )}
  </CommandPrimitive>
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

function CommandDialog({
  children,
  footerElement,
  footerClassName,
  ...props
}: CommandDialogProps & FooterProps) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command
          footerElement={footerElement}
          footerClassName={footerClassName}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    // eslint-disable-next-line react/require-default-props
    logoClassName?: string;
  }
  // eslint-disable-next-line react/prop-types
>(({ className, logoClassName, ...props }, ref) => (
  // eslint-disable-next-line react/no-unknown-property
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className={cn('mr-2 h-4 w-4 shrink-0 opacity-50', logoClassName)} />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

function CommandShortcut({
  // eslint-disable-next-line react/prop-types
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className
      )}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
}
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};

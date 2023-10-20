import React from 'react';
import { CommandItem } from '~/components/ui/command';

const CloudAppCommandItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem> & {
    primaryContent: string;
    objTypeDisplayName: string;
    logo: React.JSX.Element;
  }
>(({ primaryContent, objTypeDisplayName, logo, ...props }, ref) => (
  <CommandItem
    ref={ref}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    <div className="flex flex-row gap-4">
      {logo}

      <div className="flex flex-col justify-center">
        <span className="text-xs font-light text-gray-500">
          {objTypeDisplayName}
        </span>

        <span className="inline-flex items-center">{primaryContent}</span>
      </div>
    </div>
  </CommandItem>
));

CloudAppCommandItem.displayName = CommandItem.displayName;

export default CloudAppCommandItem;

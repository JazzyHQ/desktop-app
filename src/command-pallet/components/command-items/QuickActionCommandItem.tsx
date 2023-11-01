import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommandState } from 'cmdk';
import React from 'react';
import { toast } from 'sonner';
import { getCommandPalletSearchComponents } from '~/command-pallet/lib/utils';
import { ExecuteQuickActionCommand } from '~/commands';
import { QuickActionRow } from '~/types';
import { useCommandPalletContext } from '../provider';
import CloudAppCommandItem from './CloudAppCommandItem';

type QuickActionCommandItemProps = React.ComponentPropsWithoutRef<
  typeof CloudAppCommandItem
> & { quickAction: QuickActionRow };

export default function QuickActionCommandItem({
  quickAction,
  ...props
}: QuickActionCommandItemProps) {
  const search = useCommandState((state) => state.search);
  const searchComponents = getCommandPalletSearchComponents(search);
  const { changeSearchInputValue } = useCommandPalletContext();
  const queryClient = useQueryClient();

  const quickActionMutation = useMutation({
    mutationFn: async (data: { input: string }) => {
      return window.electron.executeCommand(
        new ExecuteQuickActionCommand({
          quickAction,
          input: data.input,
        })
      );
    },
  });

  return (
    <CloudAppCommandItem
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      onSelect={async () => {
        if (
          searchComponents.documentSearch === null ||
          searchComponents.documentSearch.length === 0
        ) {
          toast.error('Contents can not be empty');
          return;
        }
        quickActionMutation.mutateAsync(
          { input: searchComponents.documentSearch },
          {
            onSuccess: () => {
              changeSearchInputValue('');
              queryClient.invalidateQueries({ queryKey: ['search'] });
              toast.success('Success!');
            },
          }
        );
      }}
    />
  );
}

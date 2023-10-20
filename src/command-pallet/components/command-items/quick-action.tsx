import { Zap } from 'lucide-react';
import { QuickActionRow } from '~/types';
import QuickActionCommandItem from './QuickActionCommandItem';

export default class QuickActionItems {
  public static getComponentForQuickAction(quickAction: QuickActionRow) {
    return (
      <QuickActionCommandItem
        quickAction={quickAction}
        key={`quickAction${quickAction.id}`}
        primaryContent={quickAction.name}
        objTypeDisplayName="Quick Action"
        logo={<Zap className="mr-2 h-8 w-8" />}
      />
    );
  }
}

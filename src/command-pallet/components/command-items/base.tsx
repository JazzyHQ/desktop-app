/* eslint-disable import/prefer-default-export */
import { TCloudAppWithAccounts } from '~/renderer/types';
import { CloudAppType, DataNodeRow, QuickActionRow } from '~/types';
import JiraCommandItems from './jira';
import QuickActionItems from './quick-action';

const CLOUD_APP_COMMAND_ITEMS_CLASS_MAP: { [key: string]: any } = {
  [CloudAppType.JIRA]: JiraCommandItems,
};

export function getDisplayComponentForDataNode(
  app: TCloudAppWithAccounts,
  dataNode: DataNodeRow
) {
  const CommandItemClass = CLOUD_APP_COMMAND_ITEMS_CLASS_MAP[app.shortCode];
  return CommandItemClass.getComponentForObjectType(app, dataNode);
}

export function getDisplayComponentForQuickActions(
  quickAction: QuickActionRow
) {
  return QuickActionItems.getComponentForQuickAction(quickAction);
}

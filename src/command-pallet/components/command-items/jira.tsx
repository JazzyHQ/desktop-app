import OpenLocalLinkCommand from '~/commands/system/OpenLocalLinkCommand';
import { TCloudAppWithAccounts } from '~/renderer/types';
import {
  CLOUD_APP_OBJECT_TYPES,
  CloudAppType,
  DataNodeRow,
  GlobalCommandObjectTypes,
  JiraObjectTypes,
  OpenLocalLinkCommandContext,
} from '~/types';

import { TerminalSquare } from 'lucide-react';
import { JiraLogo } from '~/logos';
import CloudAppCommandItem from './CloudAppCommandItem';

export default class JiraCommandItems {
  public static shortCode = CloudAppType.JIRA;

  private static jiraObjectTypes = new Set(
    Object.values<string>(JiraObjectTypes)
  );

  private static globalCommandObjectTypes = new Set(
    Object.values<string>(GlobalCommandObjectTypes)
  );

  private static noopCallback = () => {};

  public static getComponentForObjectType(
    app: TCloudAppWithAccounts,
    dataNode: DataNodeRow
  ) {
    const appAccount = app.applicationAccounts.find((account) => !!account);
    if (!appAccount) return null;
    const jiraDomain = appAccount.extra?.url ?? '';

    if (this.jiraObjectTypes.has(dataNode.nodeType)) {
      const objectTypeDisplayName =
        CLOUD_APP_OBJECT_TYPES[this.shortCode][dataNode.nodeType];
      const metadata = dataNode.metadata as { key: string };
      return (
        <CloudAppCommandItem
          key={`node:${dataNode.id}`}
          primaryContent={`[${metadata.key}] ${dataNode.name}`}
          logo={<JiraLogo />}
          objTypeDisplayName={objectTypeDisplayName}
          onSelect={() => {
            window.open(`${jiraDomain}/browse/${metadata.key}`, '_blank');
          }}
        />
      );
    }

    if (this.globalCommandObjectTypes.has(dataNode.nodeType)) {
      const objectTypeDisplayName = 'Command';
      let handleOnSelect = JiraCommandItems.noopCallback;

      if (dataNode.nodeType === GlobalCommandObjectTypes.NAVIGATE_LOCAL) {
        const metadata = dataNode.metadata as OpenLocalLinkCommandContext;
        handleOnSelect = () => {
          window.electron.executeCommand(
            new OpenLocalLinkCommand({ url: metadata.url })
          );
        };
      }
      return (
        <CloudAppCommandItem
          key={`node:${dataNode.id}`}
          primaryContent={dataNode.name}
          objTypeDisplayName={objectTypeDisplayName}
          logo={<TerminalSquare className="mr-2 h-8 w-8" />}
          onSelect={handleOnSelect}
        />
      );
    }

    return null;
  }
}

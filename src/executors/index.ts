import {
  GetCloudApplicationsCommand,
  IndexCloudAppAccountCommand,
  IndexCloudAppByShortCodeRendererCommand,
  UpdateCloudAppAccountCommand,
  VerifyCloudAppAccountCredentialsCommand,
} from '~/commands';
import SearchForDocumentsCommand from '~/commands/system/SearchForDocumentsCommand';

import GetCloudApplicationsCommandExecutor from './GetCloudApplicationsCommandExecutor';
import IndexCloudAppAccountCommandExecutor from './IndexCloudAppAccountCommandExecutor';
import IndexCloudAppByShortCodeRendererCommandExecutor from './IndexCloudAppByShortCodeRendererCommandExecutor';
import SearchForDocumentsCommandExecutor from './SearchForDocumentsCommandExecutor';
import UpdateCloudAppAccountCommandExecutor from './UpdateCloudAppAccountCommandExecutor';
import VerifyCloudAppAccountCredentialsCommandExecutor from './VerifyCloudAppAccountCredentialsCommandExecutor';
import getJiraExecutor from './jira';
import getQuickActionExecutor from './quick-actions';
import {
  getExecutor as getSystemExecutor,
  getLocalExecutor as getSystemLocalExecutor,
} from './system';

const EXECUTOR_MAP = {
  [UpdateCloudAppAccountCommand.commandName]:
    UpdateCloudAppAccountCommandExecutor,
  [VerifyCloudAppAccountCredentialsCommand.commandName]:
    VerifyCloudAppAccountCredentialsCommandExecutor,
  [IndexCloudAppAccountCommand.commandName]:
    IndexCloudAppAccountCommandExecutor,
  [SearchForDocumentsCommand.commandName]: SearchForDocumentsCommandExecutor,
  [GetCloudApplicationsCommand.commandName]:
    GetCloudApplicationsCommandExecutor,
  [IndexCloudAppByShortCodeRendererCommand.commandName]:
    IndexCloudAppByShortCodeRendererCommandExecutor,
};

const LOCAL_COMMAND_EXECUTOR_MAP: { [key: string]: any } = {};

function getBaseExecutor(commandName: string) {
  return EXECUTOR_MAP[commandName];
}

export function getExecutor(commandName: string) {
  const executorSelectors = [
    getBaseExecutor,
    getJiraExecutor,
    getSystemExecutor,
    getQuickActionExecutor,
  ];
  for (let i = 0; i < executorSelectors.length; i += 1) {
    const executor = executorSelectors[i];
    const executorClass = executor(commandName);
    if (executorClass) {
      return executorClass;
    }
  }

  return undefined;
}

export function getBaseLocalExecutor(commandName: string) {
  return LOCAL_COMMAND_EXECUTOR_MAP[commandName];
}

export function getLocalExecutor(commandName: string) {
  const executorSelectors = [getBaseLocalExecutor, getSystemLocalExecutor];
  for (let i = 0; i < executorSelectors.length; i += 1) {
    const executor = executorSelectors[i];
    const executorClass = executor(commandName);
    if (executorClass) {
      return executorClass;
    }
  }

  return undefined;
}

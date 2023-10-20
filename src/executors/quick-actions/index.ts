import { ExecuteQuickActionCommand } from '~/commands';
import CreateQuickActionCommand from '~/commands/quick-actions/CreateQuickActionCommand';

import DeleteQuickActionCommand from '~/commands/quick-actions/DeleteQuickActionCommand';
import GetMostRecentlyUsedQuickActionsCommand from '~/commands/quick-actions/GetMostRecentlyUsedQuickActionsCommand';
import GetQuickActionsForAppAccountsCommand from '~/commands/quick-actions/GetQuickActionsForAppAccountsCommand';
import SearchForQuickActionsCommand from '~/commands/quick-actions/SearchForQuickActionsCommand';
import CreateQuickActionCommandExecutor from './CreateQuickActionCommandExecutor';
import DeleteQuickActionCommandExecutor from './DeleteQuickActionCommandExecutor';
import ExecuteQuickActionCommandExecutor from './ExecuteQuickActionCommandExecutor';
import GetMostRecentlyUsedQuickActionsCommandExecutor from './GetMostRecentlyUsedQuickActionsCommandExecutor';
import GetQuickActionsForAppAccountsCommandExecutor from './GetQuickActionsForAppAccountsCommandExecutor';
import SearchForQuickActionsCommandExecutor from './SearchForQuickActionsCommandExecutor';

const EXECUTOR_MAP = {
  [ExecuteQuickActionCommand.commandName]: ExecuteQuickActionCommandExecutor,
  [SearchForQuickActionsCommand.commandName]:
    SearchForQuickActionsCommandExecutor,
  [CreateQuickActionCommand.commandName]: CreateQuickActionCommandExecutor,
  [GetQuickActionsForAppAccountsCommand.commandName]:
    GetQuickActionsForAppAccountsCommandExecutor,
  [DeleteQuickActionCommand.commandName]: DeleteQuickActionCommandExecutor,
  [GetMostRecentlyUsedQuickActionsCommand.commandName]:
    GetMostRecentlyUsedQuickActionsCommandExecutor,
};

export default function getExecutor(commandName: string) {
  return EXECUTOR_MAP[commandName];
}

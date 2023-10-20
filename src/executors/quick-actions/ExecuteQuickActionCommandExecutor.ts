import { ExecuteQuickActionCommand } from '~/commands';
import { JiraService as JiraDBService } from '~/services/db';
import { CloudAppType } from '~/types';

import { ICommandExecutor } from '../base';
import JiraQuickActionExecutor from './jira';

const CLOUD_APP_QUICK_ACTIONS_EXECUTOR_MAP = {
  [CloudAppType.JIRA]: JiraQuickActionExecutor,
};
function getQuickActionExecutor(appType: CloudAppType) {
  return CLOUD_APP_QUICK_ACTIONS_EXECUTOR_MAP[appType];
}

export default class ExecuteQuickActionCommandExecutor extends ICommandExecutor<ExecuteQuickActionCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const dbService = new JiraDBService();
    const { quickAction } = this.command.context;
    // TODO: Need more consistency when deciding when to hydrate foreign keys
    const cloudAppAccount = await dbService.cloudApplicationAccountById(
      quickAction.applicationAccountId
    );

    const QuickActionExecutorClass = getQuickActionExecutor(
      cloudAppAccount!.application.shortCode as CloudAppType
    );

    const quickActionExecutor = new QuickActionExecutorClass(
      this.command.context,
      cloudAppAccount!
    );

    return quickActionExecutor.execute();
  }
}

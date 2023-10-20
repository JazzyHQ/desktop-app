import GetMostRecentlyUsedQuickActionsCommand from '~/commands/quick-actions/GetMostRecentlyUsedQuickActionsCommand';
import { JiraService as JiraDBService } from '~/services/db';
import { ICommandExecutor } from '../base';

export default class GetMostRecentlyUsedQuickActionsCommandExecutor extends ICommandExecutor<GetMostRecentlyUsedQuickActionsCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const dbService = new JiraDBService();
    const { limit } = this.command.context;
    return dbService.quickActions(limit);
  }
}

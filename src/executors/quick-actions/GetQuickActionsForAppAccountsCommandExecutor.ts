import GetQuickActionsForAppAccountsCommand from '~/commands/quick-actions/GetQuickActionsForAppAccountsCommand';
import { JiraService as JiraDBService } from '~/services/db';
import { ICommandExecutor } from '../base';

export default class GetQuickActionsForAppAccountsCommandExecutor extends ICommandExecutor<GetQuickActionsForAppAccountsCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const dbService = new JiraDBService();
    const { applicationAccount } = this.command.context;
    return dbService.quickActionsForAppAccount(applicationAccount);
  }
}

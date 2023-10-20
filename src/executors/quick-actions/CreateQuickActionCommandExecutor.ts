import CreateQuickActionCommand from '~/commands/quick-actions/CreateQuickActionCommand';
import { JiraService as JiraDBService } from '~/services/db';
import { ICommandExecutor } from '../base';

export default class CreateQuickActionCommandExecutor<
  T
> extends ICommandExecutor<CreateQuickActionCommand<T>> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const dbService = new JiraDBService();
    const { shortCode, ...quickAction } = this.command.context;
    return dbService.createQuickAction(shortCode, quickAction);
  }
}

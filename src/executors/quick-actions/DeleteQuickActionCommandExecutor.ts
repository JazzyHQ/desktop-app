import DeleteQuickActionCommand from '~/commands/quick-actions/DeleteQuickActionCommand';
import { JiraService as JiraDBService } from '~/services/db';
import { ICommandExecutor } from '../base';

export default class DeleteQuickActionCommandExecutor extends ICommandExecutor<DeleteQuickActionCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const dbService = new JiraDBService();
    const { id } = this.command.context;
    return dbService.deleteQuickAction(id);
  }
}

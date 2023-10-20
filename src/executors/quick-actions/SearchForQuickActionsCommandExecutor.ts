import SearchForQuickActionsCommand from '~/commands/quick-actions/SearchForQuickActionsCommand';
import { DBService } from '~/services/db';
import { ICommandExecutor } from '../base';

export default class SearchForQuickActionsCommandExecutor extends ICommandExecutor<SearchForQuickActionsCommand> {
  async execute() {
    const service = new DBService();
    const { searchTerm } = this.command.context;

    return service.searchForQuickActions(searchTerm);
  }
}

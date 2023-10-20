import SearchForDocumentsCommand from '~/commands/system/SearchForDocumentsCommand';

import { DBService } from '~/services/db';
import { ICommandExecutor } from './base';

export default class SearchForDocumentsCommandExecutor extends ICommandExecutor<SearchForDocumentsCommand> {
  async execute() {
    const service = new DBService();
    const { searchTerm } = this.command.context;

    return service.searchForDataNodes(searchTerm);
  }
}

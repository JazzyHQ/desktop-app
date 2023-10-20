import { SearchForDocumentsCommandContext } from '~/types';
import ICommand from '../base';

export default class SearchForQuickActionsCommand extends ICommand<SearchForDocumentsCommandContext> {
  static commandName = 'SearchForQuickActionsCommand';

  commandName = 'SearchForQuickActionsCommand';
}

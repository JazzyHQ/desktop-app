import { SearchForDocumentsCommandContext } from '~/types';
import ICommand from '../base';

export default class SearchForDocumentsCommand extends ICommand<SearchForDocumentsCommandContext> {
  static commandName = 'SearchForDocumentsCommand';

  commandName = 'SearchForDocumentsCommand';
}

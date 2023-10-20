import { EmptyCommandContext } from '~/types';
import ICommand from '../base';

export default class GetJiraIssueTypesCommand extends ICommand<EmptyCommandContext> {
  static commandName = 'GetJiraIssueTypesCommand';

  commandName = 'GetJiraIssueTypesCommand';
}

import { CreateJiraIssueCommandContext } from '~/types/jira';
import ICommand from '../base';

export default class CreateJiraIssueCommand extends ICommand<CreateJiraIssueCommandContext> {
  static commandName = 'CreateJiraIssueCommand';

  commandName = 'CreateJiraIssueCommand';
}

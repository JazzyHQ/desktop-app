import { EmptyCommandContext } from '~/types';
import ICommand from '../base';

export default class GetJiraProjectsCommand extends ICommand<EmptyCommandContext> {
  static commandName = 'GetJiraProjectsCommand';

  commandName = 'GetJiraProjectsCommand';
}

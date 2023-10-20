import GetJiraProjectsCommand from '~/commands/jira/GetJiraProjectsCommand';
import { JiraService } from '~/services/db';
import { ICommandExecutor } from '../base';

export default class GetJiraProjectsCommandExecutor extends ICommandExecutor<GetJiraProjectsCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const service = new JiraService();

    return service.projects();
  }
}

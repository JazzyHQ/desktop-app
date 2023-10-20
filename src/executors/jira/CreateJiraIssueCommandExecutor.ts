import CreateJiraIssueCommand from '~/commands/jira/CreateJiraIssueCommand';
import { JiraService as JiraAPIService } from '~/services/api';
import { JiraService as JiraDBService } from '~/services/db';
import { CloudAppType } from '~/types';
import { ICommandExecutor } from '../base';

export default class CreateJiraIssueCommandExecutor extends ICommandExecutor<CreateJiraIssueCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const dbService = new JiraDBService();
    const cloudAppAccount = await dbService.cloudApplicationAccountByType(
      CloudAppType.JIRA
    );

    const service = new JiraAPIService(cloudAppAccount);

    return service.createJiraIssue(this.command.context);
  }
}

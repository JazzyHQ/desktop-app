import { IndexCloudAppByShortCodeRendererCommand } from '~/commands';
import { DBService } from '~/services/db';
import { indexJiraTask } from '~/worker/tasks/jira';
import { ICommandExecutor } from './base';

export default class IndexCloudAppByShortCodeRendererCommandExecutor extends ICommandExecutor<IndexCloudAppByShortCodeRendererCommand> {
  async execute() {
    const service = new DBService();
    const { shortCode } = this.command.context;
    const cloudAppWithAccounts = await service.cloudApplicationsByShortCode(
      shortCode
    );
    cloudAppWithAccounts?.applicationAccounts.forEach((appAccount) => {
      indexJiraTask(cloudAppWithAccounts, appAccount);
    });
  }
}

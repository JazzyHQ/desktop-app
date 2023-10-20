import { IndexCloudAppAccountCommand } from '~/commands';
import { indexJiraTask } from '~/worker/tasks/jira';
import { ICommandExecutor } from './base';

export default class IndexCloudAppAccountCommandExecutor extends ICommandExecutor<IndexCloudAppAccountCommand> {
  async execute() {
    const { application, applicationAccount } = this.command.context;

    return indexJiraTask(application, applicationAccount);
  }
}

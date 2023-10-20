import { GetCloudApplicationsCommand } from '~/commands';
import { DBService } from '~/services/db';
import { ICommandExecutor } from './base';

export default class GetCloudApplicationsCommandExecutor extends ICommandExecutor<GetCloudApplicationsCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const service = new DBService();

    return service.cloudApplicationsWithAccounts();
  }
}

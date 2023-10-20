import { VerifyCloudAppAccountCredentialsCommand } from '~/commands';
import { getService } from '~/services/api';
import { ICommandExecutor } from './base';

export default class VerifyCloudAppAccountCredentialsCommandExecutor extends ICommandExecutor<VerifyCloudAppAccountCredentialsCommand> {
  async execute() {
    const { shortCode } = this.command.context;
    const Service = getService(shortCode);

    const service = new Service(this.command.context);

    return service.areCredentialsValid();
  }
}

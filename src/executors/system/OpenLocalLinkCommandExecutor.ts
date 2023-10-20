import OpenLocalLinkCommand from '~/commands/system/OpenLocalLinkCommand';
import { ILocalCommandExecutor } from '../base';

export default class OpenLocalLinkCommandExecutor extends ILocalCommandExecutor<OpenLocalLinkCommand> {
  async execute(windowManager: any) {
    const { url } = this.command.context;
    windowManager.navigateToLocalUrl(url);
    return url;
  }
}

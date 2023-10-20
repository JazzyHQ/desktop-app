import HideAllWindowsCommand from '~/commands/system/HideAllWindowsCommand';
import { hideAllWindows } from '~/main/util';
import { ICommandExecutor } from '../base';

export default class HideAllWindowsCommandExecutor extends ICommandExecutor<HideAllWindowsCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    hideAllWindows();
    return Promise.resolve();
  }
}

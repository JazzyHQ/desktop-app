import ChangeCommandPalletHeightCommand from '~/commands/system/ChangeCommandPalletHeightCommand';
import { ILocalCommandExecutor } from '../base';

export default class ChangeCommandPalletHeightCommandExecutor extends ILocalCommandExecutor<ChangeCommandPalletHeightCommand> {
  async execute(windowManager: any) {
    const { size } = this.command.context;
    windowManager.changeCommandPalletHeight(size);
    return size;
  }
}

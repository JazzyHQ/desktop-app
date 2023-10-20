import ChangeCommandPalletHeightCommand from '~/commands/system/ChangeCommandPalletHeightCommand';
import HideAllWindowsCommand from '~/commands/system/HideAllWindowsCommand';
import OpenLocalLinkCommand from '~/commands/system/OpenLocalLinkCommand';
import ChangeCommandPalletHeightCommandExecutor from './ChangeCommandPalletHeightCommandExecutor';
import HideAllWindowsCommandExecutor from './HideAllWindowsCommandExecutor';
import OpenLocalLinkCommandExecutor from './OpenLocalLinkCommandExecutor';

const EXECUTOR_MAP = {
  [HideAllWindowsCommand.commandName]: HideAllWindowsCommandExecutor,
};

const LOCAL_COMMAND_EXECUTOR_MAP = {
  [OpenLocalLinkCommand.commandName]: OpenLocalLinkCommandExecutor,
  [ChangeCommandPalletHeightCommand.commandName]:
    ChangeCommandPalletHeightCommandExecutor,
};

export function getLocalExecutor(commandName: string) {
  return LOCAL_COMMAND_EXECUTOR_MAP[commandName];
}

export function getExecutor(commandName: string) {
  return EXECUTOR_MAP[commandName];
}

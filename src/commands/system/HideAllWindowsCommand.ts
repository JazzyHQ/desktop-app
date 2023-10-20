import { EmptyCommandContext } from '~/types';
import ICommand from '../base';

export default class HideAllWindowsCommand extends ICommand<EmptyCommandContext> {
  static commandName = 'HideAllWindowsCommand';

  commandName = 'HideAllWindowsCommand';
}

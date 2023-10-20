import { OpenLocalLinkCommandContext } from '~/types';
import ICommand from '../base';

export default class OpenLocalLinkCommand extends ICommand<OpenLocalLinkCommandContext> {
  static commandName = 'OpenLocalActionCommand';

  commandName = 'OpenLocalActionCommand';
}

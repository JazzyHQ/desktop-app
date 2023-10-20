import { DeleteByIdCommandContext } from '~/types';
import ICommand from '../base';

export default class DeleteQuickActionCommand extends ICommand<DeleteByIdCommandContext> {
  static commandName = 'DeleteQuickActionCommand';

  commandName = 'DeleteQuickActionCommand';
}

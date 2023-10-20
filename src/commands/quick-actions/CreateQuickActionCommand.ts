import { CreateQuickActionCommandContext } from '~/types';
import ICommand from '../base';

export default class CreateQuickActionCommand<T> extends ICommand<
  CreateQuickActionCommandContext<T>
> {
  static commandName = 'CreateQuickActionCommand';

  commandName = 'CreateQuickActionCommand';
}

import { GetMostRecentlyUsedQuickActionsCommandContext } from '~/types';
import ICommand from '../base';

export default class GetMostRecentlyUsedQuickActionsCommand extends ICommand<GetMostRecentlyUsedQuickActionsCommandContext> {
  static commandName = 'GetQuickActionsCommand';

  commandName = 'GetQuickActionsCommand';
}

/* eslint-disable max-classes-per-file */
import {
  EmptyCommandContext,
  ExecuteQuickActionCommandContext,
  IUpsertCloudApplicationAccountParams,
  IndexCloudAppByShortCodeRendererCommandContext,
  IndexCloudApplicationAccountCommandContext,
} from '~/types';
import ICommand from './base';

export class GetCloudApplicationsCommand extends ICommand<EmptyCommandContext> {
  static commandName = 'GetCloudApplicationsCommand';

  commandName = 'GetCloudApplicationsCommand';
}

export class UpdateCloudAppAccountCommand extends ICommand<IUpsertCloudApplicationAccountParams> {
  static commandName = 'UpdateCloudAppAccountCommand';

  commandName = 'UpdateCloudAppAccountCommand';
}

export class VerifyCloudAppAccountCredentialsCommand extends ICommand<IUpsertCloudApplicationAccountParams> {
  static commandName = 'VerifyCloudAppAccountCredentialsCommand';

  commandName = 'VerifyCloudAppAccountCredentialsCommand';
}

export class IndexCloudAppAccountCommand extends ICommand<IndexCloudApplicationAccountCommandContext> {
  static commandName = 'IndexCloudAppAccountCommand';

  commandName = 'IndexCloudAppAccountCommand';
}

export class IndexCloudAppByShortCodeRendererCommand extends ICommand<IndexCloudAppByShortCodeRendererCommandContext> {
  static commandName = 'IndexCloudAppByShortCodeRendererCommand';

  commandName = 'IndexCloudAppByShortCodeRendererCommand';
}

export class ExecuteQuickActionCommand extends ICommand<ExecuteQuickActionCommandContext> {
  static commandName = 'ExecuteQuickActionCommand';

  commandName = 'ExecuteQuickActionCommand';
}

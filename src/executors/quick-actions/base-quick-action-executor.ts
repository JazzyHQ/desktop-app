import {
  ApplicationAccountRow,
  CloudAppType,
  ExecuteQuickActionCommandContext,
} from '~/types';

export default abstract class BaseQuickActionExecutor {
  public abstract appType: CloudAppType;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected quickAction: ExecuteQuickActionCommandContext,
    protected cloudAppAccount: ApplicationAccountRow // eslint-disable-next-line no-empty-function
  ) {}

  abstract execute(): any;
}

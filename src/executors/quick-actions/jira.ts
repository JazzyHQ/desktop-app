import { JiraService as JiraAPIService } from '~/services/api';
import { CloudAppType, JiraQuickActionField, QuickAction } from '~/types';
import { CreateJiraIssueCommandContext } from '~/types/jira';
import BaseQuickActionExecutor from './base-quick-action-executor';

export default class JiraQuickActionExecutor extends BaseQuickActionExecutor {
  public appType: CloudAppType = CloudAppType.JIRA;

  async execute() {
    const apiService = new JiraAPIService(this.cloudAppAccount);

    const { quickAction, input } = this.quickAction;

    const jiraQuickAction = quickAction as QuickAction<JiraQuickActionField>;

    const issueTypeId = jiraQuickAction.fields.find(
      (field) => field.type === 'issueType'
    )!.value;
    const projectId = jiraQuickAction.fields.find(
      (field) => field.type === 'project'
    )!.value;

    const createContext: CreateJiraIssueCommandContext = {
      issueTypeId,
      projectId,
      title: input,
      description: '',
    };

    const resp = await apiService.createJiraIssue(createContext);

    return resp;
  }
}

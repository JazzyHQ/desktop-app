import { AxiosInstance } from 'axios';
import { GetCloudApplicationsCommand } from './commands';
import GetJiraIssueTypesCommand from './commands/jira/GetJiraIssueTypesCommand';
import GetJiraProjectsCommand from './commands/jira/GetJiraProjectsCommand';

import GetQuickActionsForAppAccountsCommand from './commands/quick-actions/GetQuickActionsForAppAccountsCommand';
import { IUserModel, TCloudAppWithAccounts } from './renderer/types';
import { ApplicationAccountRow, QuickActionRow } from './types';
import { JiraProject, JiraProjectIssueTypesMap } from './types/jira';

export default {
  GET_USER: (api: AxiosInstance) => ({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const resp = await api.get<IUserModel>('/v1/users/me/');
      console.log(resp);
      return resp.data;
    },
  }),
  ALL_CLOUDAPPS: () => ({
    queryKey: ['cloudapps', 'all'],
    queryFn: async () => {
      const results = (await window.electron.executeCommand(
        new GetCloudApplicationsCommand({})
      )) as TCloudAppWithAccounts[];
      return results;
    },
  }),
  JIRA_PROJECTS_AND_ISSUES: () => ({
    queryKey: ['cloudapps', 'jira', 'projectsandissuetypes'],
    queryFn: async () => {
      const projects = (await window.electron.executeCommand(
        new GetJiraProjectsCommand({})
      )) as JiraProject[];

      const projectIssueTypesMap = (await window.electron.executeCommand(
        new GetJiraIssueTypesCommand({})
      )) as JiraProjectIssueTypesMap;

      return { projects, projectIssueTypesMap };
    },
  }),
  JIRA_QUICK_ACTIONS: (app: ApplicationAccountRow) => ({
    queryKey: ['cloudapps', 'jira', 'quickactions', 'all'],
    queryFn: async () => {
      const actions = (await window.electron.executeCommand(
        new GetQuickActionsForAppAccountsCommand({ applicationAccount: app })
      )) as QuickActionRow[];

      return actions;
    },
  }),
};

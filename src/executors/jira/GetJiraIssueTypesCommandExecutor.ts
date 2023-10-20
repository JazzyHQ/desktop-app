import GetJiraIssueTypesCommand from '~/commands/jira/GetJiraIssueTypesCommand';
import { JiraService as JiraAPIService } from '~/services/api';
import { JiraService as JiraDBService } from '~/services/db';
import { CloudAppType } from '~/types';
import { JiraProjectIssueTypesMap } from '~/types/jira';
import { ICommandExecutor } from '../base';

export default class GetJiraIssueTypesCommandExecutor extends ICommandExecutor<GetJiraIssueTypesCommand> {
  // eslint-disable-next-line class-methods-use-this
  async execute() {
    const projectIssueTypesMap: JiraProjectIssueTypesMap = {};

    const dbService = new JiraDBService();
    const cloudAppAccount = await dbService.cloudApplicationAccountByType(
      CloudAppType.JIRA
    );

    const apiService = new JiraAPIService(cloudAppAccount);
    const createIssuesMeta = await apiService.getAllIssueTypesForProject();

    if (!createIssuesMeta.projects) return projectIssueTypesMap;

    createIssuesMeta.projects.forEach((project) => {
      projectIssueTypesMap[project.id!] = project
        .issuetypes!.map((issueType) => ({
          cloudId: issueType.id!,
          name: issueType.name!,
          description: issueType.description!,
          iconUrl: issueType.iconUrl!,
          subtask: issueType.subtask!,
        }))
        .filter((issueType) => !issueType.subtask);
    });

    return projectIssueTypesMap;
  }
}

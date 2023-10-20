import { Version2Client, Version3Client } from 'jira.js';
import { Issue } from 'jira.js/out/version2/models';
import { Project } from 'jira.js/out/version3/models';
import { ICloudApplicationAccount } from '~/types';
import APIService from './base';

export default class JiraService extends APIService {
  private readonly credentials: ICloudApplicationAccount;

  private readonly api: Version3Client;

  private readonly v2Api: Version2Client;

  constructor(credentials: ICloudApplicationAccount) {
    super();
    this.credentials = credentials;
    this.api = new Version3Client({
      host: this.credentials.extra?.url!,
      authentication: {
        basic: {
          email: this.credentials.extra?.email!,
          apiToken: this.credentials.token,
        },
      },
      newErrorHandling: true,
    });

    this.v2Api = new Version2Client({
      host: this.credentials.extra?.url!,
      authentication: {
        basic: {
          email: this.credentials.extra?.email!,
          apiToken: this.credentials.token,
        },
      },
      newErrorHandling: true,
    });
  }

  async areCredentialsValid() {
    try {
      await this.api.myself.getCurrentUser();
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAllProjects() {
    let projects: Project[] = [];
    let isLast = false;
    const page = {
      startAt: 0,
    };
    while (!isLast) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await this.api.projects.searchProjects({
        ...page,
        typeKey: 'software',
      });
      projects = projects.concat(resp.values);
      isLast = resp.isLast;
      page.startAt += resp.values.length;
    }
    return projects;
  }

  async getAllIssueTypesForProject() {
    return this.api.issues.getCreateIssueMeta();
  }

  async createJiraIssue(issueDetails: {
    projectId: string;
    issueTypeId: string;
    title: string;
    description: string;
  }) {
    const resp = await this.api.issues.createIssue({
      fields: {
        project: {
          id: issueDetails.projectId,
        },
        issuetype: {
          id: issueDetails.issueTypeId,
        },
        summary: issueDetails.title,
        description: {
          content: [
            {
              content: [
                {
                  text: issueDetails.description,
                  type: 'text',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'doc',
          version: 1,
        },
      },
    });

    return resp;
  }

  async getProjectIssues(projectId: string) {
    let issues: Issue[] = [];
    let isLast = false;
    let startAt = 0;
    while (!isLast) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await this.v2Api.issueSearch.searchForIssuesUsingJql({
        startAt,
        jql: `project = ${projectId} AND statusCategory not in ("Done")`,
      });

      if (resp.issues?.length) {
        issues = issues.concat(resp.issues);
        startAt += resp.issues.length;
      } else {
        isLast = true;
      }
    }

    return issues;
  }
}

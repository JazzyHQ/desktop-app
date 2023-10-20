import { dataNodes } from '../db/schema/graph';

type DataNodeRow = typeof dataNodes.$inferSelect;

type DataNodeRowType = Pick<
  DataNodeRow,
  'id' | 'name' | 'description' | 'cloudId'
>;
export type JiraProject = DataNodeRowType;
export type JiraIssueType = {
  cloudId: string;
  name: string;
  description: string;
  iconUrl: string;
  subtask: boolean;
};

export type JiraProjectIssueTypesMap = {
  [key: string]: JiraIssueType[];
};

export type CreateJiraIssueCommandContext = {
  projectId: string;
  issueTypeId: string;
  title: string;
  description: string;
};

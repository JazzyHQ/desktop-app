import * as z from 'zod';
import { quickActions } from '~/db/schema/quick-actions';
import { applicationAccounts, applications } from '../db/schema/credentials';
import { dataNodes } from '../db/schema/graph';

const BaseGraphNodeSchema = z.object({
  name: z
    .string({
      required_error: "Name of the graph node can't be empty",
    })
    .trim(),
  description: z.string().trim().optional(),
});

export enum CloudAppType {
  JIRA = 'jira',
}

type GraphNode = z.infer<typeof BaseGraphNodeSchema> & {
  parent?: GraphNode;
  children: GraphNode[];
};

export const GraphNodeSchema: z.ZodType<GraphNode> = BaseGraphNodeSchema.extend(
  {
    parent: z.lazy(() => GraphNodeSchema).optional(),
    children: z.lazy(() => GraphNodeSchema.array()),
  }
);

export const GraphRootSchema = z.object({
  name: z.nativeEnum(CloudAppType),
  description: z.string().trim().optional(),
  children: GraphNodeSchema.array(),
});

export type DataNodeRow = typeof dataNodes.$inferSelect;
export type NewDataNode = typeof dataNodes.$inferInsert;

export type ApplicationAccountRow = typeof applicationAccounts.$inferSelect;
export type NewApplicationAccount = typeof applicationAccounts.$inferInsert;

export type ApplicationRow = typeof applications.$inferSelect;

export type QuickActionRow = typeof quickActions.$inferSelect;
export type NewQuickAction = typeof quickActions.$inferInsert;

export type ApplicationAccountExtraData = { url?: string; email?: string };

export interface ICloudApplicationAccount {
  token: string;
  extra?: ApplicationAccountExtraData | null;
}
export type IUpsertCloudApplicationAccountParams = ICloudApplicationAccount & {
  shortCode: CloudAppType;
};

export type IndexCloudAppByShortCodeRendererCommandContext = {
  shortCode: CloudAppType;
};

export type DeleteByIdCommandContext = {
  id: number;
};

export type GetQuickActionsForAppAccountsCommandContext = {
  applicationAccount: ApplicationAccountRow;
};

export type GetMostRecentlyUsedQuickActionsCommandContext = {
  limit?: number;
};

export type EmptyCommandContext = {};

export type IndexCloudApplicationAccountCommandContext = {
  application: ApplicationRow;
  applicationAccount: ApplicationAccountRow;
};

export type SearchForDocumentsCommandContext = {
  searchTerm: string;
};

export type OpenLocalLinkCommandContext = {
  url: string;
};

export type IGraphNode = z.infer<typeof GraphNodeSchema>;
export type IGraphRoot = z.infer<typeof GraphRootSchema>;

export enum GlobalCommandObjectTypes {
  NAVIGATE_LOCAL = '_global:navigate-local',
}

export enum JiraObjectTypes {
  PROJECT = 'projects',
  ISSUE = 'issues',
}

export const JIRA_READABLE_OBJECT_TYPES: { [key: string]: string } = {
  [JiraObjectTypes.PROJECT]: 'Project',
  [JiraObjectTypes.ISSUE]: 'Project » Issue',
};

export const CLOUD_APP_OBJECT_TYPES: {
  [key: string]: typeof JIRA_READABLE_OBJECT_TYPES;
} = {
  [CloudAppType.JIRA]: JIRA_READABLE_OBJECT_TYPES,
};

export enum CloudAppStatus {
  NEW = 'NEW',
  FAILED = 'FAILED',
  SYNCING = 'SYNCING',
  READY = 'READY',
}

export type JiraQuickActionField = {
  type: 'name' | 'project' | 'issueType';
  humanReadableName: string;
  value: string;
};

export type QuickAction<T> = {
  name: string;
  description?: string | null;
  fields: T[];
};

export type CreateQuickActionCommandContext<T> = QuickAction<T> & {
  shortCode: CloudAppType;
};
export enum WindowSize {
  SMALL,
  MEDIUM,
  LARGE,
}

export type ChangeCommandPalletHeightCommandContext = {
  size: WindowSize;
};

export type ExecuteQuickActionCommandContext = {
  quickAction: QuickActionRow;
  input: string;
};

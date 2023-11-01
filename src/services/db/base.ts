import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

import { DBClient } from '~/db/client';
import { applicationAccounts, applications } from '~/db/schema/credentials';
import { dataNodes } from '~/db/schema/graph';
import { quickActions } from '~/db/schema/quick-actions';
import {
  ApplicationAccountRow,
  CloudAppStatus,
  CloudAppType,
  NewDataNode,
  QuickAction,
} from '~/types';

type DataNodesGetRequest = {
  applicationId: number;
  applicationAccountId: number;
  nodeType: string;
  parentDataNodeId?: number;
};

type DataNodeUpdateRequest = DataNodesGetRequest & {
  cloudId: string;
  data: NewDataNode;
};

type DataNodesDeleteRequest = DataNodesGetRequest & {
  cloudIds: string[];
};

type DataNodesInsertRequest = DataNodesGetRequest & {
  data: NewDataNode[];
};

export default class DBService {
  protected dbClient: DBClient;

  constructor() {
    this.dbClient = DBClient.Instance;
  }

  public migrate() {
    return this.dbClient.migrate();
  }

  public async createQuickAction(
    appType: CloudAppType,
    data: QuickAction<any>
  ) {
    const application = await this.cloudApplicationAccountByType(appType);

    return this.dbClient.connection
      .insert(quickActions)
      .values({ ...data, applicationAccountId: application.id })
      .returning();
  }

  public async deleteQuickAction(id: number) {
    return this.dbClient.connection
      .delete(quickActions)
      .where(eq(quickActions.id, id));
  }

  public async quickActionsForAppAccount(appAccount: ApplicationAccountRow) {
    return this.dbClient.connection.query.quickActions.findMany({
      where: eq(quickActions.applicationAccountId, appAccount.id),
    });
  }

  public async quickActions(limit?: number) {
    return this.dbClient.connection.query.quickActions.findMany({
      limit: limit || 10,
    });
  }

  public async updateCloudAppStatus(id: number, status: CloudAppStatus) {
    return this.dbClient.connection
      .update(applicationAccounts)
      .set({ status })
      .where(eq(applicationAccounts.id, id));
  }

  // eslint-disable-next-line class-methods-use-this
  private escapeString(str: string) {
    return `${str.replace(/'/g, "''")}`;
  }

  // eslint-disable-next-line class-methods-use-this
  public async searchForDataNodes(searchTerm: string) {
    if (!searchTerm) return [];
    let matchingDocs: { rowid: number }[] = [];
    const escapedSearchTerm = this.escapeString(searchTerm);

    if (searchTerm.length < 3) {
      matchingDocs = this.dbClient.connection.all<{ rowid: number }>(
        sql.raw(
          `select rowid from search_idx WHERE name LIKE '%${escapedSearchTerm}%' or description LIKE '%${escapedSearchTerm}%' ORDER BY rank;`
        )
      );
    } else {
      matchingDocs = this.dbClient.connection.all<{ rowid: number }>(
        sql.raw(
          `select rowid from search_idx WHERE search_idx MATCH '"${escapedSearchTerm}"' ORDER BY rank`
        )
      );
    }

    if (matchingDocs.length === 0) return [];

    return this.dbClient.connection.query.dataNodes.findMany({
      where: inArray(
        dataNodes.id,
        matchingDocs.map((row) => row.rowid)
      ),
    });
  }

  public async searchForQuickActions(searchTerm: string) {
    if (!searchTerm) return [];
    let matchingDocs: { rowid: number }[] = [];

    if (searchTerm.length < 3) {
      return this.dbClient.connection.query.quickActions.findMany({
        limit: 10,
        orderBy: [desc(quickActions.createdAt)],
      });
    }

    matchingDocs = this.dbClient.connection.all<{ rowid: number }>(
      sql.raw(
        `select rowid from quick_action_idx WHERE quick_action_idx MATCH '${searchTerm}' ORDER BY rank`
      )
    );

    if (matchingDocs.length === 0) return [];

    return this.dbClient.connection.query.quickActions.findMany({
      where: inArray(
        quickActions.id,
        matchingDocs.map((row) => row.rowid)
      ),
    });
  }

  public async cloudApplicationsWithAccounts() {
    const ret = this.dbClient.connection.query.applications.findMany({
      with: { applicationAccounts: true },
    });

    return ret;
  }

  public async cloudAccount(id: number) {
    return this.dbClient.connection.query.applicationAccounts.findFirst({
      where: eq(applicationAccounts.id, id),
      with: { application: true },
    });
  }

  public async cloudApplicationsByShortCode(shortCode: string) {
    return this.dbClient.connection.query.applications.findFirst({
      where: eq(applications.shortCode, shortCode),
      with: { applicationAccounts: true },
    });
  }

  public async cloudApplicationAccounts() {
    return this.dbClient.connection.query.applicationAccounts.findMany({
      with: { application: true },
    });
  }

  public async cloudApplicationAccountByType(appType: CloudAppType) {
    const result = await this.dbClient.connection
      .select()
      .from(applicationAccounts)
      .innerJoin(
        applications,
        eq(applications.id, applicationAccounts.applicationId)
      )
      .where(eq(applications.shortCode, appType))
      .limit(1);

    const firstResult = result[0];

    return {
      ...firstResult.application_accounts,
      application: { ...firstResult.applications },
    };
  }

  public async cloudApplicationAccountById(id: number) {
    return this.dbClient.connection.query.applicationAccounts.findFirst({
      where: eq(applicationAccounts.id, id),
      with: { application: true },
    });
  }

  public async insertDataNodesForCloudAccount(
    nodeFilters: DataNodesInsertRequest
  ) {
    return this.dbClient.connection.insert(dataNodes).values(nodeFilters.data);
  }

  public async updateDataNodeForCloudAccount(
    nodeFilters: DataNodeUpdateRequest
  ) {
    return this.dbClient.connection
      .update(dataNodes)
      .set(nodeFilters.data)
      .where(
        and(
          eq(dataNodes.applicationAccountId, nodeFilters.applicationAccountId),
          eq(dataNodes.applicationId, nodeFilters.applicationId),
          eq(dataNodes.nodeType, nodeFilters.nodeType),
          eq(dataNodes.cloudId, nodeFilters.cloudId),
          this.parentDataNodeFilter(nodeFilters.parentDataNodeId)
        )
      );
  }

  public async deleteDataNodesForCloudAccount(
    nodeFilters: DataNodesDeleteRequest
  ) {
    return this.dbClient.connection
      .delete(dataNodes)
      .where(
        and(
          eq(dataNodes.applicationAccountId, nodeFilters.applicationAccountId),
          eq(dataNodes.applicationId, nodeFilters.applicationId),
          eq(dataNodes.nodeType, nodeFilters.nodeType),
          this.parentDataNodeFilter(nodeFilters.parentDataNodeId),
          inArray(dataNodes.cloudId, nodeFilters.cloudIds)
        )
      );
  }

  public async getDataNodesForCloudAccount(nodeFilters: DataNodesGetRequest) {
    return this.dbClient.connection.query.dataNodes.findMany({
      where: and(
        eq(dataNodes.applicationAccountId, nodeFilters.applicationAccountId),
        eq(dataNodes.applicationId, nodeFilters.applicationId),
        eq(dataNodes.nodeType, nodeFilters.nodeType),
        this.parentDataNodeFilter(nodeFilters.parentDataNodeId)
      ),
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private parentDataNodeFilter(parentDataNodeId?: number) {
    return parentDataNodeId
      ? eq(dataNodes.parentDataNodeId, parentDataNodeId)
      : isNull(dataNodes.parentDataNodeId);
  }
}

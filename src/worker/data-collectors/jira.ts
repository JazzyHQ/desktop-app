import { Issue } from 'jira.js/out/version2/models';
import { Project } from 'jira.js/out/version3/models';
import { Logger } from '~/logger';
import { JiraService } from '~/services/api';
import { JiraService as JiraDBService } from '~/services/db';
import {
  ApplicationAccountRow,
  ApplicationRow,
  CloudAppStatus,
  DataNodeRow,
  GlobalCommandObjectTypes,
  IGraphNode,
  IGraphRoot,
  JiraObjectTypes,
  NewDataNode,
  OpenLocalLinkCommandContext,
} from '~/types';

const logger = Logger.Instance;
/* eslint-disable import/prefer-default-export */
export class JiraDataCollector {
  protected dbService: JiraDBService;

  protected client: JiraService;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    protected root: IGraphRoot,
    protected application: ApplicationRow,
    protected applicationAccount: ApplicationAccountRow
  ) {
    this.dbService = new JiraDBService();
    this.client = new JiraService(applicationAccount);
  }

  protected get globalCommands() {
    const newIssueMetadata: OpenLocalLinkCommandContext = {
      url: '/actions/jira/new-jira-issue',
    };
    const newIssue: NewDataNode = {
      name: 'New Jira Issue',
      description: 'Create a new Jira issue',
      cloudId: GlobalCommandObjectTypes.NAVIGATE_LOCAL,
      nodeType: GlobalCommandObjectTypes.NAVIGATE_LOCAL,
      applicationId: this.application.id,
      applicationAccountId: this.applicationAccount.id,
      metadata: {
        ...newIssueMetadata,
      },
    };

    return [newIssue];
  }

  public async collect() {
    try {
      await this.dbService.updateCloudAppStatus(
        this.applicationAccount.id,
        CloudAppStatus.SYNCING
      );
      this.root.children.forEach(async (child) => {
        await this.collectDataForNode(child);
      });
      await Promise.allSettled(
        this.globalCommands.map(async (c) => {
          return this.createDataNodes(c.nodeType, [c]);
        })
      );
      await this.dbService.updateCloudAppStatus(
        this.applicationAccount.id,
        CloudAppStatus.READY
      );
    } catch (e) {
      await this.dbService.updateCloudAppStatus(
        this.applicationAccount.id,
        CloudAppStatus.FAILED
      );
      throw e;
    }
  }

  protected async collectDataForNode(
    graphNode: IGraphNode,
    parentObject?: DataNodeRow
  ) {
    let nodes: NewDataNode[] = [];
    // process the current node
    if (graphNode.name === JiraObjectTypes.PROJECT) {
      const allProjects = await this.client.getAllProjects();

      nodes = allProjects.map((p) => this.projectToGraphNode(graphNode, p));
    }

    if (graphNode.name === JiraObjectTypes.ISSUE && parentObject) {
      const allIssues = await this.client.getProjectIssues(
        parentObject.cloudId
      );
      nodes = allIssues.map((i) =>
        this.issueToGraphNode(graphNode, parentObject, i)
      );
    }

    // Process the children of the current node,
    // using each created parent node as the context for
    // processing the children nodes
    if (nodes.length > 0) {
      const createdDataNodes = await this.createDataNodes(
        graphNode.name,
        nodes,
        parentObject
      );
      createdDataNodes.forEach((n) => {
        graphNode.children.forEach((child) => {
          this.collectDataForNode(child, n);
        });
      });
    }
  }

  protected async createDataNodes(
    nodeType: string,
    nodes: NewDataNode[],
    parentDataNode?: DataNodeRow
  ) {
    // get all existing nodes
    // delete all nodes that no longer exist
    // update all the nodes that exist
    // insert the remaining nodes

    const parentDataNodeId = parentDataNode ? parentDataNode.id : undefined;

    const idsToDelete = new Set<string>();
    const idsToUpdate = new Set<string>();
    const idsToCreate = new Set<string>();
    const newNodeCloudIds = new Set(nodes.map((n) => n.cloudId));

    const existingDataNodes = await this.dbService.getDataNodesForCloudAccount({
      applicationId: this.application.id,
      applicationAccountId: this.applicationAccount.id,
      nodeType,
      parentDataNodeId,
    });

    // check which existing IDs we have in the DB and not in the list
    // of IDs we got back from the API
    const existingCloudIds = new Set(existingDataNodes.map((n) => n.cloudId));
    existingCloudIds.forEach((id) => {
      if (!newNodeCloudIds.has(id)) {
        idsToDelete.add(id);
      }
    });
    // check which IDs need to be updated and which need to be created
    newNodeCloudIds.forEach((id) => {
      if (existingCloudIds.has(id)) {
        idsToUpdate.add(id);
      } else {
        idsToCreate.add(id);
      }
    });

    logger.info(
      'Creating data nodes for Jira data. Insert: %d, Update: %d, Delete: %d',
      idsToCreate.size,
      idsToUpdate.size,
      idsToDelete.size
    );

    if (idsToDelete.size > 0) {
      // delete all the nodes that no longer exist
      await this.dbService.deleteDataNodesForCloudAccount({
        applicationId: this.application.id,
        applicationAccountId: this.applicationAccount.id,
        nodeType,
        cloudIds: Array.from(idsToDelete),
        parentDataNodeId,
      });
    }

    // update all the nodes that exist
    if (idsToUpdate.size > 0) {
      const updatePromises = Array.from(idsToUpdate).map(async (id) => {
        const node = nodes.find((n) => n.cloudId === id);
        if (node) {
          return this.dbService.updateDataNodeForCloudAccount({
            applicationId: this.application.id,
            applicationAccountId: this.applicationAccount.id,
            nodeType,
            cloudId: id,
            data: node,
            parentDataNodeId,
          });
        }
        return Promise.resolve();
      });

      await Promise.allSettled(updatePromises);
    }

    const nodesToInsert = nodes.filter((n) => idsToCreate.has(n.cloudId));
    if (nodesToInsert.length > 0) {
      await this.dbService.insertDataNodesForCloudAccount({
        applicationId: this.application.id,
        applicationAccountId: this.applicationAccount.id,
        nodeType,
        data: nodesToInsert,
        parentDataNodeId,
      });
    }

    return this.dbService.getDataNodesForCloudAccount({
      applicationAccountId: this.applicationAccount.id,
      applicationId: this.application.id,
      nodeType,
      parentDataNodeId,
    });
  }

  private issueToGraphNode(
    graphNode: IGraphNode,
    parentNode: DataNodeRow,
    issue: Issue
  ) {
    const newNode: NewDataNode = {
      name: `${issue.fields.summary}`,
      cloudId: issue.id,
      parentDataNodeId: parentNode.id,
      description: issue.fields.description,
      nodeType: graphNode.name,
      applicationId: this.application.id,
      applicationAccountId: this.applicationAccount.id,
      metadata: {
        key: issue.key,
      },
    };

    return newNode;
  }

  private projectToGraphNode(graphNode: IGraphNode, project: Project) {
    const newNode: NewDataNode = {
      name: `${project.name}`,
      cloudId: project.id,
      description: project.key,
      nodeType: graphNode.name,
      applicationId: this.application.id,
      applicationAccountId: this.applicationAccount.id,
      metadata: {
        key: project.key,
      },
    };

    return newNode;
  }
}

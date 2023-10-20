import { CloudAppType, IGraphNode, IGraphRoot, JiraObjectTypes } from '~/types';

const JiraGraph: IGraphRoot = {
  name: CloudAppType.JIRA,
  description: 'Jira data graph',
  children: [],
};

const ProjectNode: IGraphNode = {
  name: JiraObjectTypes.PROJECT,
  description: 'All Jira projects inside a Jira organization',
  parent: JiraGraph,
  children: [],
};

const IssuesNode: IGraphNode = {
  name: JiraObjectTypes.ISSUE,
  description: 'All Jira issues inside a Jira project',
  parent: ProjectNode,
  children: [],
};

JiraGraph.children.push(ProjectNode);
ProjectNode.children.push(IssuesNode);

export default JiraGraph;

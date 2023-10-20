import CreateJiraIssueCommand from '~/commands/jira/CreateJiraIssueCommand';
import GetJiraIssueTypesCommand from '~/commands/jira/GetJiraIssueTypesCommand';
import GetJiraProjectsCommand from '~/commands/jira/GetJiraProjectsCommand';
import CreateJiraIssueCommandExecutor from './CreateJiraIssueCommandExecutor';
import GetJiraIssueTypesCommandExecutor from './GetJiraIssueTypesCommandExecutor';
import GetJiraProjectsCommandExecutor from './GetJiraProjectsCommandExecutor';

const EXECUTOR_MAP = {
  [GetJiraProjectsCommand.commandName]: GetJiraProjectsCommandExecutor,
  [GetJiraIssueTypesCommand.commandName]: GetJiraIssueTypesCommandExecutor,
  [CreateJiraIssueCommand.commandName]: CreateJiraIssueCommandExecutor,
};

export default function getExecutor(commandName: string) {
  return EXECUTOR_MAP[commandName];
}

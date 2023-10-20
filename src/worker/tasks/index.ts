/* eslint-disable import/prefer-default-export */
import { Logger } from '~/logger';
import { ApplicationAccountRow, ApplicationRow, CloudAppType } from '~/types';
import { indexJiraTask } from './jira';

const logger = Logger.Instance;

const INDEX_TASK_MAP = {
  [CloudAppType.JIRA.toString()]: indexJiraTask,
};
export function indexTask(
  application: ApplicationRow,
  applicationAccount: ApplicationAccountRow
) {
  logger.info('Scheduling data to index ', application);
  const indexer = INDEX_TASK_MAP[application.shortCode];
  if (indexer) {
    logger.info('Indexer found. Scheduling indexing of data');
    return indexer(application, applicationAccount);
  }
  return Promise.resolve();
}

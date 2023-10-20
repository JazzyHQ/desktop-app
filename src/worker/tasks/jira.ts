/* eslint-disable import/prefer-default-export */
import { JiraGraph } from '~/graph';
import { Logger } from '~/logger';
import { ApplicationAccountRow, ApplicationRow } from '~/types';
import { JiraDataCollector } from '../data-collectors/jira';
import { indexLimiter } from './rate-limiters';

const logger = Logger.Instance;

export function indexJiraTask(
  application: ApplicationRow,
  applicationAccount: ApplicationAccountRow
) {
  logger.info('Scheduling indexing of Jira data');
  return indexLimiter.schedule(async () => {
    // logger.info('Indexing of Jira data scheduled');

    const jiraDataCollector = new JiraDataCollector(
      JiraGraph,
      application,
      applicationAccount
    );
    logger.info('Collecting Jira data...');
    return jiraDataCollector.collect();
  });
}

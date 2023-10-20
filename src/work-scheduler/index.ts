import { CronJob } from 'cron';
import { MessagePortMain } from 'electron';
import { IndexCloudAppAccountCommand } from '~/commands';

import { Logger } from '~/logger';
import { DBService } from '~/services/db';

let port: MessagePortMain;

const logger = Logger.Instance;

process.parentPort.once('message', (e) => {
  [port] = e.ports;
  const indexJiraSchedule = new CronJob(
    '0 */5 * * * *',
    async () => {
      const service = new DBService();
      const cloudAccounts = await service.cloudApplicationAccounts();
      logger.info('Scheduling cloud accounts for re-indexing');
      cloudAccounts.forEach(async (account) => {
        logger.info(
          'Starting to send command for cloud account: %d account type: %s',
          account.id,
          account.application.shortCode
        );
        port.postMessage({
          command: new IndexCloudAppAccountCommand({
            application: account.application,
            applicationAccount: account,
          }),
        });

        logger.info('Done scheduling cloud accounts for re-indexing');
      });
    },
    null,
    false,
    'America/Los_Angeles'
  );

  indexJiraSchedule.start();

  port.start();
});

console.log('Hello from worker scheduler');

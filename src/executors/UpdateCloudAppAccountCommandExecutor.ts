import { eq } from 'drizzle-orm';
import { UpdateCloudAppAccountCommand } from '~/commands';
import { DBClient } from '~/db/client';
import * as credentialsSchema from '~/db/schema/credentials';
import { NewApplicationAccount } from '~/types';
import { ICommandExecutor } from './base';

export default class UpdateCloudAppAccountCommandExecutor extends ICommandExecutor<UpdateCloudAppAccountCommand> {
  async execute() {
    const dbClient = DBClient.Instance;
    const dbConn = dbClient.connection;
    const { shortCode, token, extra } = this.command.context;

    const application = await dbConn.query.applications.findFirst({
      where: eq(credentialsSchema.applications.shortCode, shortCode),
    });

    if (!application) {
      throw new Error(`Application with short code ${shortCode} not found`);
    }

    const newApplicationAccount: NewApplicationAccount = {
      token,
      extra,
      applicationId: application.id,
      status: 'NEW',
    };

    const existingAppAccount = await dbConn.query.applicationAccounts.findFirst(
      {
        where: eq(
          credentialsSchema.applicationAccounts.applicationId,
          application.id
        ),
      }
    );

    if (existingAppAccount) {
      return dbConn
        .update(credentialsSchema.applicationAccounts)
        .set(newApplicationAccount)
        .where(
          eq(credentialsSchema.applicationAccounts.id, existingAppAccount.id)
        )
        .returning();
    }

    return dbConn
      .insert(credentialsSchema.applicationAccounts)
      .values(newApplicationAccount)
      .returning();
  }
}

import { and, eq } from 'drizzle-orm';
import { dataNodes } from '~/db/schema/graph';
import { CloudAppType, JiraObjectTypes } from '~/types';
import DBService from './base';

export default class JiraService extends DBService {
  SHORT_CODE = CloudAppType.JIRA;

  public async projects() {
    const application = await this.cloudApplicationsByShortCode(
      this.SHORT_CODE
    );
    if (!application) return [];

    const projectDataNodes =
      await this.dbClient.connection.query.dataNodes.findMany({
        where: and(
          eq(dataNodes.applicationId, application.id),
          eq(dataNodes.nodeType, JiraObjectTypes.PROJECT)
        ),
      });

    return projectDataNodes.map((projectDataNode) => {
      return {
        id: projectDataNode.id,
        name: projectDataNode.name,
        description: projectDataNode.description,
        cloudId: projectDataNode.cloudId,
      };
    });
  }
}

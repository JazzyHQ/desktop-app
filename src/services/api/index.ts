/* eslint-disable max-classes-per-file */
import { CloudAppType } from '~/types';
import JiraService from './jira';

export { default as JiraService } from './jira';

const SERVICES_REGISTRY = {
  [CloudAppType.JIRA]: JiraService,
};

export function getService(shortCode: CloudAppType) {
  return SERVICES_REGISTRY[shortCode];
}

import { ApplicationAccountRow, ApplicationRow } from '~/types';

export interface IOrganizationModel {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface IUserModel {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  organization: IOrganizationModel;
}

export interface IRefreshedAccessToken {
  access: string;
}

export interface IAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface INavigateCommand {
  url: string;
}

export interface IJiraConnectionExtraData {
  url?: string;
  email?: string;
}
export interface ICloudApp {
  status: 'NEW' | 'FAILED' | 'SYNCING' | 'READY' | null;
  token: string;
  extra: { url?: string; email?: string };
  id: number;
  tokenSecret: string | null;
  updatedAt: Date | null;
  createdAt: Date | null;
  expiresAt: Date | null;
  applicationId: number;
  application: {
    id: number;
    name: string;
    shortCode: string;
    clientId: string;
    clientSecret: string | null;
  };
}

export type TCloudAppWithAccounts = ApplicationRow & {
  applicationAccounts: ApplicationAccountRow[];
};

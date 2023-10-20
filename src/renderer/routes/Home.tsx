import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GetCloudApplicationsCommand } from '~/commands';
import { Button } from '~/components/ui/button';
import { ApplicationAccountRow, ApplicationRow, CloudAppStatus } from '~/types';
import jira from '../../../assets/apps/jira.svg';
import { TCloudAppWithAccounts } from '../types';

const logoMap: { [key: string]: string } = {
  jira,
};

const connectUrls: { [key: string]: string } = { jira: '/connect/jira' };
const settingsUrls: { [key: string]: string } = {
  jira: '/settings/jira/connection',
};

function Status({
  app,
  appAccount,
}: {
  app: ApplicationRow;
  // eslint-disable-next-line react/require-default-props
  appAccount?: ApplicationAccountRow;
}) {
  let bgColor = 'bg-gray-50';
  let content = (
    <>
      Not Connected <span className="sr-only"> {app.name} not connected</span>
    </>
  );
  if (appAccount?.status === CloudAppStatus.READY) {
    bgColor = 'bg-green-100';
    content = (
      <>
        Connected <span className="sr-only"> {app.name} connected</span>
      </>
    );
  } else if (
    appAccount?.status === CloudAppStatus.SYNCING ||
    appAccount?.status === CloudAppStatus.NEW
  ) {
    bgColor = 'bg-yellow-100';
    content = (
      <>
        Syncing <span className="sr-only"> {app.name} is syncing</span>
      </>
    );
  } else if (appAccount?.status === CloudAppStatus.FAILED) {
    bgColor = 'bg-red-100';
    content = (
      <>
        Issue with connection{' '}
        <span className="sr-only">
          {' '}
          {app.name} has an issue with the connection
        </span>
      </>
    );
  }
  return (
    <div className={`absolute inset-x-0 bottom-0 px-1 py-1 sm:px-6 ${bgColor}`}>
      <div className="text-center text-xs">{content}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { data: cloudApps } = useQuery({
    queryKey: ['cloudapps', 'all'],
    queryFn: async () => {
      const apps = (await window.electron.executeCommand(
        new GetCloudApplicationsCommand({})
      )) as TCloudAppWithAccounts[];
      return apps;
    },
  });

  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3 xl:gap-x-8">
      {(cloudApps ?? []).map((app) => (
        <li
          key={app.id}
          className="overflow-hidden rounded-sm border border-gray-200 shadow-md"
        >
          <div className="relative flex items-center gap-x-4 border-b border-gray-900/5 bg-white p-4 pb-10">
            <img
              src={logoMap[app.shortCode]}
              alt={app.name}
              className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            />
            <div className="text-sm font-medium leading-4 text-gray-900">
              {app.name}
            </div>
            <div className="relative ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  return app.applicationAccounts.length > 0
                    ? navigate(settingsUrls[app.shortCode])
                    : navigate(connectUrls[app.shortCode]);
                }}
              >
                {app.applicationAccounts.length > 0 ? <Settings /> : 'Connect'}
              </Button>
            </div>
            {app.applicationAccounts.length > 0 ? (
              <Status app={app} appAccount={app.applicationAccounts[0]} />
            ) : (
              <Status app={app} appAccount={undefined} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

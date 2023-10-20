import { QueryClient } from '@tanstack/react-query';

import React from 'react';
import { LoaderFunctionArgs, useParams } from 'react-router-dom';
import JiraSettingsLayout from './jira/layout';

export const loader = (queryClient: QueryClient) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const data = queryClient.fetchQuery(
      ['cloudappaccounts', 'all'],
      async () => {
        const { app: application } = params;
        const cloudApps = await window.electron.getCloudApps();
        const app = cloudApps.find(
          (c) => c.application.shortCode === application
        );
        return { app };
      }
    );
    return data;
  };
};

const connectViews: { [key: string]: () => React.JSX.Element } = {
  jira: JiraSettingsLayout,
};

export default function Settings() {
  const { app } = useParams<{ app: string }>();
  const View = connectViews[app!];
  return (
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      {View ? <View /> : <div>Error loading settings page</div>}
    </div>
  );
}

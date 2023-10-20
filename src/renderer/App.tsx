import React, { useEffect } from 'react';
import {
  createHashRouter,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import HideAllWindowsCommand from '~/commands/system/HideAllWindowsCommand';
import AuthenticatedLayout, {
  AuthError,
  loader as authLoader,
} from './routes/Auth';

import './tailwind/tailwind.css';

import { NewJiraIssueForm } from './actions/jira';
import Connect from './routes/connect';
import Home from './routes/Home';
import Login from './routes/Login';
import Settings, { loader as settingsLoader } from './routes/settings';

const queryClient = new QueryClient();
export const routes: RouteObject[] = [
  {
    element: <AuthenticatedLayout />,
    loader: authLoader(queryClient),
    errorElement: <AuthError />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/actions/:app/new-jira-issue',
        element: <NewJiraIssueForm />,
      },
      {
        path: '/settings/:app/:tab',
        element: <Settings />,
        loader: settingsLoader(queryClient),
      },
      {
        path: '/connect/:app',
        element: <Connect />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
];
const router = createHashRouter(routes);

export default function App() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        window.electron.executeCommand(new HideAllWindowsCommand({}));
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools position="bottom-left" />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

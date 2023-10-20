import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import HideAllWindowsCommand from '~/commands/system/HideAllWindowsCommand';

import CommandPallet from './components/CommandPallet';

import '~/renderer/tailwind/tailwind.css';

const queryClient = new QueryClient();

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
        <CommandPallet />
        <ReactQueryDevtools position="bottom-left" />
        <Toaster position="top-center" closeButton />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

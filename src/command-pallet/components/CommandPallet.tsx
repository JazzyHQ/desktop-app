import { useQuery } from '@tanstack/react-query';
import { Command as CMDKCommand, useCommandState } from 'cmdk';
import { useEffect, useMemo, useRef, useState } from 'react';

import ChangeCommandPalletHeightCommand from '~/commands/system/ChangeCommandPalletHeightCommand';
import SearchForDocumentsCommand from '~/commands/system/SearchForDocumentsCommand';

import GetMostRecentlyUsedQuickActionsCommand from '~/commands/quick-actions/GetMostRecentlyUsedQuickActionsCommand';
import SearchForQuickActionsCommand from '~/commands/quick-actions/SearchForQuickActionsCommand';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from '~/components/ui/command';
import { ONE_MINUTES_IN_MS } from '~/constants';
import { useDebounce } from '~/hooks';
import { classNames } from '~/lib/utils';
import queries from '~/queries';
import { TCloudAppWithAccounts } from '~/renderer/types';
import { DataNodeRow, QuickActionRow, WindowSize } from '~/types';
import {
  areQuickActionsActive,
  getCommandPalletSearchComponents,
} from '../lib/utils';
import {
  getDisplayComponentForDataNode,
  getDisplayComponentForQuickActions,
} from './command-items/base';

import { QUICK_ACTION_SEARCH_SEPARATOR_REGEX } from '../constants';
import { CommandPalletContext } from './provider';

function CommandPalletFooter() {
  const search = useCommandState((state) => state.search);

  return (
    <div className="flex flex-wrap items-center bg-gray-50 px-4 py-1 text-xs text-gray-700">
      Type{' '}
      <kbd
        className={classNames(
          'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
          areQuickActionsActive(search)
            ? 'border-indigo-600 text-indigo-600'
            : 'border-gray-400 text-gray-900'
        )}
      >
        #
      </kbd>{' '}
      <span>to start creating issue.</span>
      (filter issue types by typing{' '}
      <kbd
        className={classNames(
          'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
          areQuickActionsActive(search) &&
            search.search(QUICK_ACTION_SEARCH_SEPARATOR_REGEX) !== -1
            ? 'border-indigo-600 text-indigo-600'
            : 'border-gray-400 text-gray-900'
        )}
      >
        |
      </kbd>{' '}
      )
    </div>
  );
}

function CommandPallet() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const cloudAppsRef = useRef<{ [key: number]: TCloudAppWithAccounts }>({});

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Focus on the input every time the window comes into focus
  useEffect(() => {
    function handleFocus() {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    const removeCallback = window.electron.onWindowFocus(handleFocus);

    return removeCallback;
  }, []);

  const { data: apps } = useQuery<TCloudAppWithAccounts[]>({
    ...queries.ALL_CLOUDAPPS(),
    staleTime: ONE_MINUTES_IN_MS,
  });

  cloudAppsRef.current = useMemo(() => {
    if (apps) {
      const appsRef: { [key: number]: TCloudAppWithAccounts } = {};
      apps.forEach((app) => {
        appsRef[app.id] = app;
      });
      return appsRef;
    }
    return {};
  }, [apps]);

  const quickActionsActive = useMemo(() => {
    return areQuickActionsActive(debouncedSearch);
  }, [debouncedSearch]);

  const searchQueries = useMemo(() => {
    return getCommandPalletSearchComponents(debouncedSearch);
  }, [debouncedSearch]);

  const documentSearch = useQuery<DataNodeRow[]>({
    queryKey: ['search', 'documents', debouncedSearch],
    queryFn: async () => {
      if (
        searchQueries.documentSearch === '' ||
        searchQueries.documentSearch.length < 2 ||
        quickActionsActive
      )
        return Promise.resolve([]);
      const results = (await window.electron.executeCommand(
        new SearchForDocumentsCommand({
          searchTerm: searchQueries.documentSearch,
        })
      )) as DataNodeRow[];
      console.log('executing search for ', searchQueries.documentSearch);
      return results;
    },
    staleTime: ONE_MINUTES_IN_MS,
    keepPreviousData: true,
  });

  const quickActionSearch = useQuery({
    queryKey: ['search', 'quickActions', searchQueries.quickActionSearch],
    queryFn: async () => {
      if (!quickActionsActive) return Promise.resolve([]);

      if (
        searchQueries.quickActionSearch === null ||
        searchQueries.quickActionSearch.length === 0
      ) {
        const allResults = (await window.electron.executeCommand(
          new GetMostRecentlyUsedQuickActionsCommand({ limit: 5 })
        )) as Promise<QuickActionRow[]>;

        return allResults;
      }

      const results = (await window.electron.executeCommand(
        new SearchForQuickActionsCommand({
          searchTerm: searchQueries.quickActionSearch,
        })
      )) as QuickActionRow[];
      console.log('executing quick action search for ', searchQueries);
      return results;
    },
    staleTime: ONE_MINUTES_IN_MS,
    keepPreviousData: true,
  });

  const quickActionSearchResults = useMemo(() => {
    if (quickActionSearch.data) {
      return quickActionSearch.data.map((item) => {
        return getDisplayComponentForQuickActions(item);
      });
    }
    return null;
  }, [quickActionSearch.data]);

  const searchResults = useMemo(() => {
    if (cloudAppsRef.current && documentSearch.data) {
      return documentSearch.data.map((item) => {
        const app = cloudAppsRef.current[item.applicationId];
        if (!app) return null;
        return getDisplayComponentForDataNode(app, item);
      });
    }

    return null;
  }, [documentSearch.data]);

  useEffect(() => {
    if (!documentSearch.isSuccess || !documentSearch.data) {
      return;
    }
    if (
      quickActionsActive &&
      (!quickActionSearch.isSuccess || !quickActionSearch.data)
    ) {
      return;
    }

    let totalElementsCount = 0;

    if (quickActionsActive) {
      if (quickActionSearch.data && documentSearch.data)
        totalElementsCount =
          quickActionSearch.data.length + documentSearch.data.length;
    } else {
      totalElementsCount = documentSearch.data?.length || 0;
    }

    if (totalElementsCount === 0) {
      window.electron.executeCommand(
        new ChangeCommandPalletHeightCommand({
          size: WindowSize.SMALL,
        })
      );
    }

    if (totalElementsCount >= 1 && totalElementsCount < 3) {
      window.electron.executeCommand(
        new ChangeCommandPalletHeightCommand({
          size: WindowSize.MEDIUM,
        })
      );
    }

    if (totalElementsCount >= 3) {
      window.electron.executeCommand(
        new ChangeCommandPalletHeightCommand({
          size: WindowSize.LARGE,
        })
      );
    }
  }, [
    documentSearch.data,
    documentSearch.isSuccess,
    quickActionSearch.data,
    quickActionSearch.isSuccess,
    quickActionsActive,
  ]);

  const commandPalletContext = useMemo(() => {
    return {
      searchValue: search,
      changeSearchInputValue: setSearch,
    };
  }, [search]);

  return (
    <CommandPalletContext.Provider value={commandPalletContext}>
      <Command
        shouldFilter={false}
        filter={() => 1}
        footerElement={<CommandPalletFooter />}
      >
        <CommandInput
          ref={inputRef}
          value={search}
          onValueChange={setSearch}
          placeholder="Type a command or search..."
          className="h-14 text-lg"
          logoClassName="h-6 w-6"
        />
        {documentSearch.isError && (
          <CMDKCommand.Loading>Something went wrong</CMDKCommand.Loading>
        )}
        <CommandList>
          {quickActionSearch.isSuccess &&
            quickActionSearch.data &&
            quickActionSearch.data.length > 0 && (
              <CommandGroup heading="Quick Actions">
                {quickActionSearchResults}
              </CommandGroup>
            )}

          {documentSearch.isSuccess &&
            documentSearch.data &&
            documentSearch.data.length > 0 && (
              <CommandGroup heading="Search Results">
                {searchResults}
              </CommandGroup>
            )}
        </CommandList>
      </Command>
    </CommandPalletContext.Provider>
  );
}

export default CommandPallet;

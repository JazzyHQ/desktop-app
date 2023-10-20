/* eslint-disable import/prefer-default-export */

import {
  QUICK_ACTION_CHARACTER,
  QUICK_ACTION_SEARCH_SEPARATOR_REGEX,
} from '../constants';
import { CommandPalletSearchComponents } from '../types';

export function areQuickActionsActive(input: string): boolean {
  return input.length > 0 && input[0] === QUICK_ACTION_CHARACTER;
}

export function getCommandPalletSearchComponents(
  input: string
): CommandPalletSearchComponents {
  const searchStrings: CommandPalletSearchComponents = {
    documentSearch: '',
    quickActionSearch: null,
  };
  if (!areQuickActionsActive(input)) {
    searchStrings.documentSearch = input;
  } else if (input.search(QUICK_ACTION_SEARCH_SEPARATOR_REGEX) === -1) {
    searchStrings.documentSearch = input.substring(1).trim();
    searchStrings.quickActionSearch = '';
  } else {
    searchStrings.documentSearch = input
      .substring(1, input.search(QUICK_ACTION_SEARCH_SEPARATOR_REGEX))
      .trim();
    searchStrings.quickActionSearch = input
      .substring(input.search(QUICK_ACTION_SEARCH_SEPARATOR_REGEX) + 1)
      .trim();
  }

  return searchStrings;
}

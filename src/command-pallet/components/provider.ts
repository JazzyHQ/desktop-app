import React from 'react';

export type CommandPalletContextProps = {
  /**
   * Optional controlled state for the value of the search input.
   */
  searchValue: string;
  /**
   * Event handler called when the search value changes.
   */
  changeSearchInputValue: (search: string) => void;
};

export const CommandPalletContext =
  React.createContext<CommandPalletContextProps>({
    searchValue: '',
    changeSearchInputValue(): void {
      throw new Error('Function not implemented.');
    },
  });

export const useCommandPalletContext = () =>
  React.useContext(CommandPalletContext);

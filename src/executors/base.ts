/* eslint-disable max-classes-per-file */
import ICommand from '~/commands/base';

export abstract class ICommandExecutor<T = ICommand<any>> {
  command: T;

  constructor(input: T) {
    this.command = input;
  }

  abstract execute(): Promise<any>;
}

export abstract class ILocalCommandExecutor<T = ICommand<any>> {
  command: T;

  constructor(input: T) {
    this.command = input;
  }

  abstract execute(windowManager: any): Promise<any>;
}

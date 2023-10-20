import { MessagePortMain } from 'electron';
import { getExecutor } from '~/executors';
import { Logger } from '~/logger';

const logger = Logger.Instance;

let port: MessagePortMain;
process.parentPort.once('message', (e) => {
  [port] = e.ports;
  port.on('message', (event) => {
    const { command } = event.data;
    logger.info(
      'Worker received a command to execute: %s',
      command.commandName
    );
    const CommandExecutorClass = getExecutor(command.commandName);
    if (CommandExecutorClass) {
      return new CommandExecutorClass(command).execute();
    }
    logger.error("Could not find an executor for command: '%s'", command);
    return undefined;
  });
  port.start();
});

logger.info('Hello from worker');

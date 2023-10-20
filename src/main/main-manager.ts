/* eslint-disable max-classes-per-file */
import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  MessageChannelMain,
  Tray,
  UtilityProcess,
  app,
  globalShortcut,
  ipcMain,
  screen,
  shell,
  utilityProcess,
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import ICommand from '~/commands/base';
import { getExecutor, getLocalExecutor } from '~/executors';
import { Logger } from '~/logger';
import { DBService } from '~/services/db';
import { WindowSize } from '~/types';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const logger = Logger.Instance;
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export default class MainProcessManager {
  private static RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  private dbService: DBService;

  private isAuthenticated = false;

  private mainWindow: BrowserWindow | null = null;

  private commandPallet: BrowserWindow | null = null;

  private workScheduler: UtilityProcess | null = null;

  private worker: UtilityProcess | null = null;

  private dbClient = new DBService();

  constructor() {
    this.dbService = new DBService();
    this.dbClient.migrate();
  }

  private static getAssetPath(...paths: string[]): string {
    return path.join(this.RESOURCES_PATH, ...paths);
  }

  public async navigateToLocalUrl(url: string) {
    if (this.mainWindow) {
      this.sendEventToMainWindow('command:navigate', { url });
      this.focusMainWindow();
    }
  }

  public async createTrayMenu() {
    const tray = new Tray(
      MainProcessManager.getAssetPath('icons', 'trayTemplate@2x.png')
    );
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Search',
        type: 'normal',
        accelerator: 'CmdOrCtrl+J',
        click: async () => this.focusCommandPallet(),
      },
      {
        label: 'Open Settings',
        type: 'normal',
        accelerator: 'CmdOrCtrl+Shift+J',
        click: () => this.focusMainWindow(),
      },
      { type: 'separator' },
      { label: 'Exit', type: 'normal', click: () => app.quit() },
    ]);
    tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu);
  }

  public async createWorkScheduler() {
    const { port1, port2 } = new MessageChannelMain();
    const dbDataFile = `${app.getPath('userData')}/sqlite.db`;

    const workSchedulerEntryPoint = app.isPackaged
      ? path.join(__dirname, 'workScheduler.js')
      : path.join(__dirname, '../../.erb/dll/workScheduler.js');

    const workerEntryPoint = app.isPackaged
      ? path.join(__dirname, 'worker.js')
      : path.join(__dirname, '../../.erb/dll/worker.js');

    this.worker = utilityProcess.fork(workerEntryPoint, [], {
      env: { DATABASE_DATA_FILE: dbDataFile },
    });
    this.worker.on('exit', () => {
      this.worker = null;
      console.log('worker closed');
    });

    this.workScheduler = utilityProcess.fork(workSchedulerEntryPoint, [], {
      env: { DATABASE_DATA_FILE: dbDataFile },
    });
    this.workScheduler.on('exit', () => {
      this.workScheduler = null;
      console.log('work scheduler closed');
    });

    this.worker.postMessage('port', [port1]);
    this.workScheduler.postMessage('port', [port2]);
  }

  public async createCommandPalletWindow() {
    this.commandPallet = new BrowserWindow({
      show: false,
      frame: false,
      resizable: true,
      alwaysOnTop: true,
      width: 700,
      height: 175,
      icon: MainProcessManager.getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    this.commandPallet.loadURL(`${resolveHtmlPath('commandPallet.html')}`);

    this.commandPallet.on('blur', () => {
      if (this.commandPallet) this.commandPallet.hide();
    });

    // Open urls in the user's browser
    this.commandPallet.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    this.commandPallet.on('closed', () => {
      this.commandPallet = null;
    });
  }

  public async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      show: false,
      frame: false,
      width: 800,
      height: 600,
      icon: MainProcessManager.getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    this.mainWindow.loadURL(`${resolveHtmlPath('index.html')}#/`);

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(this.mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    this.mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    this.mainWindow.on('blur', () => {
      if (this.mainWindow) this.mainWindow.hide();
    });

    // eslint-disable-next-line no-new
    new AppUpdater();
  }

  private static calculateCommandPalletSize(
    window: BrowserWindow,
    size: WindowSize
  ) {
    const winBounds = window.getBounds();
    const whichScreen = screen.getDisplayNearestPoint({
      x: winBounds.x,
      y: winBounds.y,
    });
    const { width } = whichScreen.size;
    let height = 290;
    if (size === WindowSize.SMALL) {
      height = 145;
    } else if (size === WindowSize.MEDIUM) {
      height = 310;
    } else {
      height = 350;
    }

    return [width * 0.4, height];
  }

  public changeCommandPalletHeight(size: WindowSize) {
    if (this.commandPallet) {
      const [calcWidth, calcHeight] =
        MainProcessManager.calculateCommandPalletSize(this.commandPallet, size);

      this.commandPallet.setSize(calcWidth, calcHeight, true);
    }
  }

  private async focusCommandPallet() {
    // TODO: Check if we have any active integrations. If we don't
    // then open the main window first.

    const resize = (window: BrowserWindow) => {
      const [calcWidth, calcHeight] =
        MainProcessManager.calculateCommandPalletSize(window, WindowSize.SMALL);
      const [, currentHeight] = window.getSize();
      window.setSize(calcWidth, Math.max(calcHeight, currentHeight), true);
    };

    if (!this.isAuthenticated) {
      MainProcessManager.showWindow(this.mainWindow, this.commandPallet);
      return;
    }

    if (this.commandPallet && this.commandPallet.isFocused()) {
      this.commandPallet.hide();
    } else {
      MainProcessManager.showWindow(
        this.commandPallet,
        this.mainWindow,
        resize
      );
    }
  }

  public focusMainWindow() {
    if (this.mainWindow && this.mainWindow.isMinimized())
      this.mainWindow.restore();

    if (this.mainWindow && this.mainWindow.isFocused()) {
      this.mainWindow.hide();
    } else {
      MainProcessManager.showWindow(this.mainWindow, this.commandPallet);
    }
  }

  private registerGlobalEventHandlers() {
    // Show the login window on start-up if the user is not authenticated
    this.mainWindow?.once('ready-to-show', () => {
      if (!this.isAuthenticated)
        MainProcessManager.showWindow(this.mainWindow, this.commandPallet);
    });

    // Register global shortcut keys
    globalShortcut.register('CommandOrControl+J', async () => {
      this.focusCommandPallet();
    });

    globalShortcut.register('CommandOrControl+Shift+J', () => {
      this.focusMainWindow();
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow === null) this.createMainWindow();
      if (this.commandPallet === null) this.createCommandPalletWindow();
    });

    // Kill background processes when app is closed
    app.on('quit', () => {
      if (this.workScheduler) {
        this.workScheduler.kill();
      }
      if (this.worker) {
        this.worker.kill();
      }
    });
  }

  public initializeApplication() {
    this.initializeIPCHandlers();
    this.createTrayMenu();

    this.createMainWindow();
    this.createCommandPalletWindow();
    this.createWorkScheduler();

    this.registerGlobalEventHandlers();
  }

  public initializeIPCHandlers() {
    ipcMain.on('auth:success', () => {
      this.isAuthenticated = true;
    });

    ipcMain.on('auth:failed', () => {
      this.isAuthenticated = false;
    });

    ipcMain.handle('cloud-apps:get', async () => {
      return this.dbService.cloudApplicationAccounts();
    });

    const handleExecuteCommand = async (
      _event: IpcMainInvokeEvent,
      command: ICommand<any>
    ) => {
      const CommandExecutorClass = getExecutor(command.commandName);
      const LocalCommandExecutorClass = getLocalExecutor(command.commandName);
      if (CommandExecutorClass) {
        return new CommandExecutorClass(command).execute();
      }
      if (LocalCommandExecutorClass) {
        return new LocalCommandExecutorClass(command).execute(this);
      }

      logger.error('Could not find a command executor for %s', command);
      return Promise.reject(new Error('Could not find a command executor'));
    };

    ipcMain.handle('command:execute', handleExecuteCommand.bind(this));
  }

  public navigateToUrl(url: string) {
    if (!this.isAuthenticated) return;

    if (this.mainWindow) {
      this.mainWindow.loadURL(url);
      this.focusMainWindow();
    }
  }

  public sendEventToMainWindow(event: string, ...args: any[]) {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(event, ...args);
    }
  }

  private static showWindow(
    window: BrowserWindow | null,
    otherWindow: BrowserWindow | null,
    resize?: (window: BrowserWindow) => void
  ) {
    if (window) {
      window.center();

      if (resize) {
        resize(window);
        window.center();
      }

      window.show();
      window.focus();
      if (otherWindow) {
        otherWindow.hide();
      }
    }
  }

  public get isClientAuthenticated() {
    return this.isAuthenticated;
  }
}

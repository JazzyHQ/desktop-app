/* eslint-disable import/prefer-default-export */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app } from 'electron';
import path from 'path';
import { IAuthTokens } from 'renderer/types';
import MainProcessManager from './main-manager';

const PROTOCOL = process.env.APP_PROTOCOL || 'shiftcommands';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

const mainProcessManager = new MainProcessManager();

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

export function getMainProcessManager(): MainProcessManager {
  return mainProcessManager;
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function handleDeepLink(url: string) {
  const parsedUrl = new URL(url);
  const params = new URLSearchParams(parsedUrl.search);

  const accessToken = params.get('access_token');
  if (!accessToken) {
    return;
  }

  const refreshToken = params.get('refresh_token');
  if (!refreshToken) {
    return;
  }

  const authCredentials: IAuthTokens = {
    accessToken,
    refreshToken,
  };

  mainProcessManager.sendEventToMainWindow('auth:login', authCredentials);

  mainProcessManager.focusMainWindow();
}

// This is handling for deep links on Windows.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    // the commandLine is array of strings in which last element is deep link url
    const url = commandLine.pop();
    if (url) {
      handleDeepLink(url);
    }
  });
}

// This is handling for deep links on macOS.
// Triggered after a user has successfully logged in via an
// external browser.
app.on('open-url', (_event, url) => {
  handleDeepLink(url);
});

app
  .whenReady()
  .then(() => {
    mainProcessManager.initializeApplication();
  })
  .catch(console.log);

// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IAuthTokens, ICloudApp, INavigateCommand } from 'renderer/types';
import ICommand from '~/commands/base';

export type Channels = 'ipc-example' | 'auth:success' | 'auth:failed';
export type LoginCallback = (
  event: IpcRendererEvent,
  value: IAuthTokens
) => void;
export type NavigateCommandCallback = (
  event: IpcRendererEvent,
  value: INavigateCommand
) => void;
type NoDataCallback = (event: IpcRendererEvent) => void;
export type FocusCallback = NoDataCallback;
export type BlurCallback = NoDataCallback;
type CallbackFunctionType =
  | LoginCallback
  | FocusCallback
  | BlurCallback
  | NavigateCommandCallback;

function registerCallback(e: string, callback: CallbackFunctionType) {
  ipcRenderer.on(e, callback);

  return () => {
    ipcRenderer.removeListener(e, callback);
  };
}

const electronHandler = {
  baseAPIURL: process.env.BASE_API_URL || 'http://localhost:8001/api',
  loginUrl: process.env.LOGIN_URL || 'http://localhost:8001/desktop/login/',
  onLogin(callback: LoginCallback) {
    ipcRenderer.on('auth:login', callback);
    return () => {
      ipcRenderer.removeListener('auth:login', callback);
    };
  },
  onNavigate(callback: NavigateCommandCallback) {
    return registerCallback('command:navigate', callback);
  },
  onWindowFocus(callback: FocusCallback) {
    return registerCallback('window:focus', callback);
  },
  onWindowBlur(callback: BlurCallback) {
    return registerCallback('window:blur', callback);
  },
  emitAuthSuccess() {
    ipcRenderer.send('auth:success');
  },
  emitAuthFailed() {
    ipcRenderer.send('auth:failed');
  },
  getCloudApps(): Promise<ICloudApp[]> {
    return ipcRenderer.invoke('cloud-apps:get');
  },
  executeCommand(command: ICommand<any>) {
    return ipcRenderer.invoke('command:execute', command);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

import { Capacitor } from '@capacitor/core';

const LOCAL = 'local';

export async function setLocalMode()  {
  if (Capacitor.isNativePlatform()) {
    localStorage.setItem('serverUrl', LOCAL);
  }
}

export async function isLocaleMode() {
  return Capacitor.isNativePlatform() && localStorage.getItem('serverUrl') === LOCAL;
}

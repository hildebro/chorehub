import { Capacitor } from '@capacitor/core';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const ssr = false;
export const prerender = false;

export const load = async ({ url }) => {
  if (Capacitor.isNativePlatform()) {
    const serverUrl = localStorage.getItem('serverUrl');

    if (!serverUrl && url.pathname !== resolve('/server-picker')) {
      return redirect(302, resolve('/server-picker'));
    }
  }

  // logged_in_user will be overridden in the (authenticated) area with the actual user.
  // help_text can be overridden in any page, if there is something to explain.
  return { logged_in_user: null, help_text: null };
};

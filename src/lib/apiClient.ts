import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { hc } from 'hono/client';
import { resolve } from '$app/paths';
import type { AppType } from '$lib/backend/api';
import { getBaseUrl } from '$lib/config';
import { handleDemoMode, isDemoMode } from '$lib/demo';

export function getApiClient(customFetch?: typeof fetch) {
  // Use the provided fetch (useful for SvelteKit load functions) or fallback to the global browser fetch
  const baseFetch = customFetch || fetch;

  // Create our interceptor
  const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (await isDemoMode()) {
      return handleDemoMode(input, init);
    }

    // 1. Clone the init object and headers so we don't mutate the original
    const requestInit = { ...init };
    const headers = new Headers(requestInit.headers);
    if (requestInit.body instanceof FormData) {
      headers.delete('Content-Type');
    } else {
      headers.set('Content-Type', 'application/json');
    }

    // 2. Inject Auth Token for Mobile, or ensure Cookies for Web
    if (Capacitor.isNativePlatform()) {
      const { value: token } = await Preferences.get({ key: 'session_token' });
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } else {
      // Ensure web requests send the httpOnly cookie if making cross-origin requests
      requestInit.credentials = 'include';
    }

    requestInit.headers = headers;

    // 3. Execute the actual network request
    const response = await baseFetch(input, requestInit);

    // 4. Intercept the response to check for a refreshed token globally!
    if (Capacitor.isNativePlatform()) {
      const refreshedToken = response.headers.get('x-refreshed-token');
      if (refreshedToken) {
        await Preferences.set({
          key: 'session_token',
          value: refreshedToken
        });
      }
    }

    return response;
  };

  // Pass our intercepted fetch to Hono
  return hc<AppType>(getBaseUrl() + resolve('/'), { fetch: authFetch });
}

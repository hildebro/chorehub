import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolve } from '$app/paths';
import { getApiClient } from '$lib/apiClient';
import * as m from '$lib/paraglide/messages.js';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

	const needsInitiation =  await handleApiLoad(client.api.public.needsInitiation.$get());
  // Navigate away, if initiation is already initiated.
  if (!needsInitiation) {
    return redirect(302, resolve('/'));
  }

  return {
    help_text: m.initiate_info()
  };
};

import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import * as m from '$lib/paraglide/messages.js';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ params, fetch }) => {
  if (params.task === 'add') return { task: null, help_text: m.schedule_info() };

  const client = getApiClient(fetch);

  return {
    task: await handleApiLoad(client.api.tasks[':task'].$get({ param: { task: params.task } })),
    help_text: m.schedule_info()
  };
};

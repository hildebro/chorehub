import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import * as m from '$lib/paraglide/messages.js';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ url, params, fetch }) => {
  const purchaseId = url.searchParams.get('purchaseId');

  if (params.entry === 'add') {
    return { entry: null, purchaseId, help_text: m.balance_info() };
  }

  const client = getApiClient(fetch);

  return {
    entry: await handleApiLoad(client.api.balance[':entry'].$get({ param: { entry: params.entry } })),
    purchaseId,
    help_text: m.balance_info()
  };
};

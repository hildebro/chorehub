import type { PageLoad } from './$types';
import { getApiClient } from '$lib/apiClient';
import * as m from '$lib/paraglide/messages.js';
import { handleApiLoad } from '$lib/utils/apiHelper';

export const load: PageLoad = async ({ fetch }) => {
	const client = getApiClient(fetch);

  return {
    shopping_item_count: await handleApiLoad(client.api.shopping.activeCount.$get()),
    last_purchase_date: await handleApiLoad(client.api.shopping.lastPurchaseDate.$get()),
    user_debts: await handleApiLoad(client.api.balance.debts.$get()),
    help_text: m.dashboard_help()
  };
};

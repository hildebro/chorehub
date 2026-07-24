import type { PageLoad } from './$types';
import * as m from '$lib/paraglide/messages.js';

export const load: PageLoad = async () => {
  return {
    help_text: m.server_picker_info()
  };
};

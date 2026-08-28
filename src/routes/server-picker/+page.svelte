<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import { setLocalMode } from '$lib/localMode';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';
  import { handleApiLoad } from '$lib/utils/apiHelper';

  let inputUrl = $state('');

  async function saveUrl() {
    if (!inputUrl) {
      addToast({ message: m.server_picker_input_invalid(), type: 'warning' });
    }

    localStorage.setItem('serverUrl', inputUrl);
    const client = getApiClient();

    try {
      const result = await handleApiLoad(client.api.public.marco.$get());

      if (result === 'polo') {
        await goto(resolve('/'));
      } else {
        localStorage.removeItem('serverUrl');
        addToast({ title: m.server_picker_error(), message: result });
      }
    } catch (error) {
      localStorage.removeItem('serverUrl');
      addToast({ title: m.server_picker_error(), message: error as string });
    }
  }

  async function localMode() {
    await setLocalMode();
    await goto(resolve('/'));
  }
</script>

<main>
  <article>
    <h2>{m.server_picker_header()}</h2>
    <p>{m.server_picker_text()}</p>

    <input
      type="url"
      bind:value={inputUrl}
      placeholder="https://your-server.com"
    />
    <div class="action-row">
      <button type="button" onclick={saveUrl}>{m.server_picker_connect()}</button>
      <button type="button" onclick={localMode}>{m.local_mode()}</button>
    </div>
  </article>
</main>

<style>
    main {
        align-content: center;
    }
</style>

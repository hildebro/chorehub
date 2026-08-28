<script lang="ts">
  import { Capacitor } from '@capacitor/core';
  import { Menu } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import { getBaseUrl } from '$lib/config';
  import * as m from '$lib/paraglide/messages.js';
  import { handleApiLoad } from '$lib/utils/apiHelper';

  let { logged_in_user } = $props();

  let remoteVersion = $state<string|undefined>();
  let serverVersion = $state<string|undefined>();

  let isOpen = $state(false);
  let wrapper = $state<HTMLElement>();

  const toggleMenu = () => {
    isOpen = !isOpen;
  };

  async function logout() {
    const client = getApiClient();
    return client.api.users.logout.$post();
  }

  function exitInstance() {
    localStorage.removeItem('serverUrl');
    goto(resolve('/server-picker'));
    isOpen = false;
  }

  // Close the dropdown if the user clicks outside the component
  const handleOutsideClick = (event: MouseEvent) => {
    if (isOpen && wrapper && !wrapper.contains(event.target as Node)) {
      isOpen = false;
    }
  };

  async function onSuccess() {
    await invalidateAll();
    await goto(resolve('/login'));
    isOpen = false;
  }

  const newVersionAvailable = (version: string) => {
    if (!remoteVersion) {
      return false;
    }

    if (remoteVersion === '?') {
      return false;
    }

    return remoteVersion !== version;
  }

  onMount(async () => {
    // Don't check for version, if we are on mobile and don't have a defined server yet.
    if (Capacitor.isNativePlatform() && getBaseUrl() === '') {
      return;
    }

    const client = getApiClient(fetch);
    ({ remoteVersion, serverVersion } = await handleApiLoad(client.api.public.version.$get()));
  });
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="header-dropdown-wrapper" bind:this={wrapper}>
  <button class="header-action" onclick={toggleMenu} aria-expanded={isOpen}>
    <Menu size={24} />
    <span>{ m.header_menu() }</span>
  </button>

  {#if isOpen}
    <div class="header-dropdown">
      <div class="header-dropdown-info">
        <div>
          {#if logged_in_user}
            { m.header_user({ name: logged_in_user.username }) }
          {/if}
        </div>
        {#if remoteVersion}
          <div>
            {m.footer_remote_version({ version: remoteVersion })}
          </div>
        {/if}
        {#if serverVersion}
          <div class:warning={newVersionAvailable(serverVersion)}>
            {m.footer_server_version({ version: serverVersion })}
          </div>
        {/if}
        {#if Capacitor.isNativePlatform()}
          <div class:warning={newVersionAvailable(__APP_VERSION__)}>
            {m.footer_app_version({ version: __APP_VERSION__ })}
          </div>
        {/if}
      </div>

      <div class="header-dropdown-actions">
        {#if logged_in_user}
          <a href={resolve('/settings')} class="header-dropdown-item" onclick={() => isOpen = false}>
            { m.header_settings() }
          </a>

          <ApiForm submitAction={logout} submitButtonHidden {onSuccess}>
            <button type="submit" class="header-dropdown-item" style="width: 100%">
              {m.auth_logout()}
            </button>
          </ApiForm>
        {/if}

        {#if Capacitor.isNativePlatform() && localStorage.getItem('serverUrl')}
          <button class="header-dropdown-item" onclick={exitInstance}>{m.settings_mobile_return_to_wrapper()}</button>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
    .warning {
        color: var(--btn-warning-text);
    }
</style>

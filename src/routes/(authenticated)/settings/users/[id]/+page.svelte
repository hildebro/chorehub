<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { Admin } from '$lib/utils/userHelper';

  let { data } = $props();

  let id = $derived(data.user?.id);
  let householdId = $derived(data.user?.householdId || '');
  let username = $derived(data.user?.username || '');
  let password = $derived(undefined);
  let admin = $derived(data.user?.admin ?? Admin.None);

  async function saveUser() {
    const client = getApiClient();
    return client.api.users.update.$post({
      json: { id: id ?? null, householdId, username, password, admin }
    });
  }

  function translateAdmin(admin: Admin) {
    switch (admin) {
      case Admin.Server:
        return m.settings_users_admin_server();
      case Admin.Household:
        return m.settings_users_admin_household();
      case Admin.None:
        return m.settings_users_admin_none();
    }
  }
</script>

<article>
  <h2>
    {#if data.user}
      { m.settings_users_edit() }
    {:else }
      { m.settings_users_add() }
    {/if}
  </h2>
  <div class="action-row">
    <ApiForm submitAction={saveUser} onSuccess={resolve('/settings/households')}>
      {#if !data.user}
        <ApiFormItem
          label={m.settings_users_household()}
          name="householdId"
          type="select"
          bind:value={householdId}
        >
          <option value="" selected></option>
          {#each data.households as household (household.id)}
            <option value={household.id}>{household.name}</option>
          {/each}
        </ApiFormItem>
      {/if}
      <ApiFormItem
        label={m.initiate_username()}
        name="username"
        bind:value={username}
      />
      <ApiFormItem
        label={data.user ? m.settings_user_data_password() : m.auth_register_password()}
        name="password"
        type="password"
        bind:value={password}
      />
      <ApiFormItem
        label={m.settings_users_admin()}
        name="admin"
        type="select"
        bind:value={admin}
      >
        {#each Object.values(Admin) as adminOptions (adminOptions)}
          <option value={adminOptions}>{translateAdmin(adminOptions)}</option>
        {/each}
      </ApiFormItem>
    </ApiForm>
  </div>
</article>

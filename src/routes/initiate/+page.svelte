<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let householdName = $state('');
  let username = $state('');
  let password = $state('');

  async function initiate() {
    const client = getApiClient();
    return client.api.public.initiate.$post({ json: { householdName, username, password } });
  }

  let files: FileList | undefined = $state();

  async function importDatabase() {
    const dumpFile = files && files.length > 0
      ? files[0]
      : new File([], '');

    const client = getApiClient();
    return client.api.public.importDatabase.$post({ form: { dumpFile } });
  }
</script>

<main>
  <article>
    <ApiForm submitAction={initiate} submitButtonText={m.initiate_submit()} onSuccess={resolve('/')}>
      <ApiFormItem
        label={m.initiate_household_name()}
        name="householdName"
        bind:value={householdName}
      />
      <ApiFormItem
        label={m.initiate_username()}
        name="username"
        bind:value={username}
      />
      <ApiFormItem
        label={m.auth_register_password()}
        name="password"
        type="password"
        bind:value={password}
      />
    </ApiForm>
  </article>
  <article>
    <ApiForm
      submitAction={importDatabase}
      onSuccess={resolve('/login')}
      submitButtonText={m.settings_actions_import()}
    >
      <ApiFormItem
        type="file"
        name="dumpFile"
        label={m.settings_actions_import_file_label()}
        accept="application/gzip, .tar.gz, .gz"
        bind:files={files}
      />
    </ApiForm>
  </article>
</main>

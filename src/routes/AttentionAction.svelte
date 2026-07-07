<script lang="ts">
  import { CircleAlert } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { attentionRequired } = $props();

  async function submitAction() {
    const client = getApiClient();
    return client.api.users.dismissHelpDisclaimer.$post();
  }

  async function onSuccess() {
    await goto(resolve('/shopping'));
  }

  let attentionDialog: HTMLDialogElement;
</script>

{#if attentionRequired}
  <dialog bind:this={attentionDialog}>
    <p>{m.initiate_disclaimer()}</p>
    <ApiForm {submitAction} {onSuccess} submitButtonText={m.initiate_disclaimer_dismiss()}>
      <button type="button" onclick={() => attentionDialog.close()}>{m.generic_close()}</button>
    </ApiForm>
  </dialog>

  <button class="header-action flashing" onclick={() => attentionDialog.showModal()}>
    <CircleAlert />
    {m.generic_attention()}
  </button>
{/if}

<style>
    dialog {
        white-space: pre-line;
    }

    .flashing {
        animation: blinker 2s linear infinite;
    }

    @keyframes blinker {
        0%,49% {
            color: var(--text-heading);
        }
        50%,100% {
            color: var(--btn-error-bg);
        }
    }
</style>

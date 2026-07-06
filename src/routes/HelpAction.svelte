<script lang="ts">
  import { CircleQuestionMark } from 'lucide-svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { help_text } = $props();

  let helpDialog: HTMLDialogElement;
</script>

<dialog bind:this={helpDialog}>
  <h3>{m.generic_help()}</h3>
  <p>{help_text}</p>
  <form method="dialog">
    <button>{m.generic_close()}</button>
  </form>
</dialog>

<button disabled={!help_text} class="header-action" onclick={() => helpDialog.showModal()}>
  <CircleQuestionMark />
  {m.generic_help()}
</button>

<style>
    dialog {
        white-space: pre-line;
    }
</style>

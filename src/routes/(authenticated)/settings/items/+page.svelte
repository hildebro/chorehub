<script lang="ts">
  import { Undo2 } from 'lucide-svelte';
  import { invalidateAll } from '$app/navigation';
  import { getApiClient } from '$lib/apiClient';
  import CategorizedItemSelect from '$lib/CategorizedItemSelect.svelte';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormGroup from '$lib/components/ApiFormGroup.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let showInactiveItems = $state(false);

  let { data } = $props();

  let itemIds = $state<string[]>([]);

  let pendingCategoryId = $state<string>('');

  async function setCategory() {
    const client = getApiClient();
    return client.api.shopping.setItemCategory.$post({
      json: { categoryId: pendingCategoryId, itemIds }
    });
  }

  async function deactivateItems() {
    const client = getApiClient();
    return client.api.shopping.deactivateItems.$post({ json: { itemIds } });
  }

  async function deleteItems() {
    const client = getApiClient();
    return client.api.shopping.deleteItems.$post({ json: { itemIds } });
  }

  async function onSuccess() {
    itemIds = [];
    await invalidateAll();
  }

  async function onDeleteSuccess() {
    await onSuccess();
    deleteDialog.close();
  }

  let deleteDialog: HTMLDialogElement;
</script>

{#if data.categories.every(category => category.shoppingItems.length === 0)}
  <article>{m.settings_items_empty()}</article>
{:else}
  <div class="action-bar">
    <label>
      <input type="checkbox" checked={showInactiveItems} onchange={() => showInactiveItems = !showInactiveItems} />
      { m.settings_items_show_inactive() }
    </label>
  </div>
  <CategorizedItemSelect bind:value={itemIds} categories={data.categories} unfiltered={showInactiveItems} />
  <article>
    <ApiForm
      submitAction={setCategory}
      {onSuccess}
      submitButtonHidden={true}
    >
      <ApiFormGroup name="itemIds" label={m.settings_items_change_category()}>
        <div class="action-row">
          {#each data.categories as category (category.id)}
            <button
              type="submit"
              onclick={() => pendingCategoryId = category.id}
            >
              {category.name}
            </button>
          {/each}
        </div>
      </ApiFormGroup>
    </ApiForm>
    <hr />
    <h2>{ m.settings_items_other_actions() }</h2>
    <div class="action-row">
      <ApiForm
        submitAction={deactivateItems}
        submitButtonClasses="warning"
        submitButtonText={m.settings_items_deactivate()}
        {onSuccess}
      >
        <ApiFormItem
          label=""
          name="itemIds"
          value={itemIds}
          type="hidden"
        />
      </ApiForm>
      <button class="error" onclick={() => deleteDialog.showModal()}>
        { m.settings_items_delete() }
      </button>
    </div>
  </article>

  <dialog bind:this={deleteDialog}>
    <ApiForm
      submitAction={deleteItems}
      onSuccess={onDeleteSuccess}
      submitButtonText={m.generic_confirm()}
    >
      <h2>{m.settings_items_delete()}</h2>
      <p>{ m.settings_items_delete_info() }</p>
      <ApiFormItem
        label=""
        name="itemIds"
        value={itemIds}
        type="hidden"
      />
      {#snippet additionalButtons()}
        <button
          type="button"
          onclick={() => deleteDialog.close()}
        >
          <Undo2 />
          { m.generic_cancel() }
        </button>
      {/snippet}
    </ApiForm>
  </dialog>
{/if}

<style>
    hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>

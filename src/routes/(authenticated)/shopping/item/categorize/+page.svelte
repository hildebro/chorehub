<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormGroup from '$lib/components/ApiFormGroup.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';

  let { data } = $props();

  let itemIds = $state([]);

  let pendingCategoryId = $state<string>('');

  async function submitCategorizeAction() {
    const client = getApiClient();
    return client.api.shopping.categorizeItems.$post({
      json: { itemIds, categoryId: pendingCategoryId }
    });
  }

  async function onCategorizeSuccess(response: Response) {
    const json = await response.json();
    if (json?.finished) {
      await goto(resolve('/shopping'));
    }

    await invalidateAll();
  }

  async function submitNewCategoryAction() {
    const client = getApiClient();
    return client.api.shopping.category.$post({
      json: { name: categoryName, id: null }
    });
  }

  let categoryName = $state('');

  async function onNewCategorySuccess() {
    await invalidateAll();
    categoryName = '';
  }

  async function cancelAction() {
    const client = getApiClient();
    return client.api.shopping.cancelStagedItems.$post();
  }
</script>

<svelte:head>
  <title>{ m.shopping_categorize() }</title>
</svelte:head>

<div class="action-bar">
  <ApiForm
    submitAction={cancelAction}
    submitButtonText={m.shopping_cancel_staging()}
    onSuccess={resolve('/shopping')}
  >
    <span></span>
  </ApiForm>
</div>
<article>
  <h2>{ m.shopping_categorize() }</h2>

  { m.shopping_categorize_select_items() }
  <div class="select-container">
    {#each data.items.filter(item => item.status === 'unmatched' && item.selectedCategoryId === null) as item (item.id)}
      <label>
        <input type="checkbox" name="itemIds" value={item.id} bind:group={itemIds} />
        {item.name}
      </label>
    {/each}
  </div>

  <ApiForm
    submitAction={submitCategorizeAction}
    onSuccess={onCategorizeSuccess}
    submitButtonHidden={true}
  >
    <ApiFormGroup name="itemIds" label={m.shopping_categorize_select_category()}>
      <div class="action-row">
        {#each data.selectableCategories as category (category.id)}
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
  <ApiForm
    submitAction={submitNewCategoryAction}
    onSuccess={onNewCategorySuccess}
    submitButtonText={m.settings_categories_add()}
  >
    <ApiFormItem
      label={m.shopping_categorize_new_category()}
      name="name"
      bind:value={categoryName}
    />
  </ApiForm>
</article>

<style>
    .select-container {
        margin-top: 1rem;
        margin-bottom: 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
    }
</style>

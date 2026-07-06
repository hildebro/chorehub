<script lang="ts">
  import levenshteinPkg from 'fast-levenshtein';
  import { CircleAlert, CirclePlus, Trash2 } from 'lucide-svelte';
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';
  import { handleApiLoad } from '$lib/utils/apiHelper';
  // The actual function is usually on the '.get' property for this library
  const levenshtein = levenshteinPkg.get;

  let { data } = $props();

  let correctionRequired = $state(true);

  type RowItem = {
    amount: string,
    name: string,
    preventCorrection: boolean,
    overwrittenName?: string
  };

  let items: RowItem[] = $state(
    [{
      amount: '',
      name: '',
      preventCorrection: false,
      overwrittenName: undefined
    }]
  );

  let amountRefs: HTMLInputElement[] = [];
  let nameRefs: HTMLInputElement[] = [];

  async function addEmptyRow() {
    items.push({ amount: '', name: '', preventCorrection: false });

    // Wait for DOM update
    await tick();

    // Focus the 'amount' field of the newly created last item
    const lastIndex = items.length - 1;
    amountRefs[lastIndex]?.focus();
  }

  function addSuggestion(name: string) {
    for (const index in items) {
      if (items[index].name.trim().length === 0 && items[index].amount.trim().length === 0) {
        items[index].name = name;

        // Ensure we still have an empty line at the end after insertion.
        if (items[items.length - 1].name.trim().length > 0) {
          items.push({ amount: '', name: '', preventCorrection: false });
        }

        return;
      }
    }

    // Push the suggestion and a new empty line, if no empty line was present to fill.
    items.push({ amount: '', name, preventCorrection: false });
    items.push({ amount: '', name: '', preventCorrection: false });
  }

  function suggestionNotPresent(name: string) {
    return !items.find(item => item.name === name);
  }

  function deleteItem(index: number) {
    if (items.length > 1) {
      items.splice(index, 1);
    } else {
      // If we only have a single line, we clear it instead of removing it. It's not a great UX to
      // have no input fields at all.
      items[index].amount = '';
      items[index].name = '';
      items[index].preventCorrection = false;
      items[index].overwrittenName = undefined;
    }
  }

  async function handleKeyDown(e: KeyboardEvent, index: number, field: 'amount' | 'name') {
    const isEnter = e.key === 'Enter';
    const isTabForward = e.key === 'Tab' && !e.shiftKey;

    if (!isEnter && !isTabForward) {
      // Any kind of manual change to the input fields should force corrections again.
      correctionRequired = true;
      items[index].preventCorrection = false;
      items[index].overwrittenName = undefined;

      return;
    }

    e.preventDefault();

    if (field === 'amount') {
      // Jump to Name in same row
      nameRefs[index]?.focus();
    } else {
      // Jump to next row or create a new one
      const isLastItem = index === items.length - 1;

      if (isLastItem) {
        await addEmptyRow();
      } else {
        amountRefs[index + 1]?.focus();
      }
    }
  }

  function applyCorrections(e: MouseEvent) {
    if (!correctionRequired) {
      // With this return, the corrections will be skipped and the normal submit action will come next.
      return;
    }

    let anyItemCorrected = false;
    for (const index in items) {
      anyItemCorrected = handleCorrection(parseInt(index)) || anyItemCorrected;
    }

    if (anyItemCorrected) {
      // Prevent the button from causing a submit.
      e.preventDefault();
      // Let the user know about executed corrections.
      addToast({
        title: m.shopping_add_items_correction_title(),
        message: m.shopping_add_items_correction_description(),
        duration: 6000
      });
      // Flip the value, so the next submit won't execute corrections again. Note that it's
      // technically more appropriate to update this flag outside the if-clause. Whether something
      // was corrected doesn't really matter for this flag: It could be set to false regardless.
      // But that would cause the correction button to be removed from the DOM and in turn prevent
      // the submit action. Since we only want to prevent it, if an item was corrected, we are
      // forced to keep it here.
      correctionRequired = false;
    }
  }

  async function submitAction() {
    const client = getApiClient();
    return client.api.shopping.items.$post({
      json: items
    });
  }

  async function onSuccess() {
    const client = getApiClient();
    const stagedList = await handleApiLoad(client.api.shopping.stagedItems.$get());
    if (!stagedList) {
      await goto(resolve('/shopping'));
    } else {
      await goto(resolve('/shopping/item/categorize'));
    }
  }

  /**
   * Returns true, if the item has been corrected.
   */
  function handleCorrection(index: number): boolean {
    let itemToCorrect = items[index];
    if (itemToCorrect.preventCorrection) {
      return false;
    }

    const nameToCorrect = itemToCorrect.name.trim().toLowerCase();
    if (nameToCorrect.length === 0) {
      return false;
    }

    // Dynamic maximum distance: Shorter words get less leeway.
    // Length <= 4: max 1 typo
    // Length 5-7: max 2 typos
    // Length 8+: max 3 typos
    let maxDistance = 1;
    if (nameToCorrect.length >= 5) maxDistance = 2;
    if (nameToCorrect.length >= 8) maxDistance = 3;

    let closestItem = null;
    let minDistanceFound = Infinity;

    for (const item of data.allItems) {
      const compareName = item.name.trim().toLowerCase();

      // If an exact match exists on the ORIGINAL string, abort correction.
      if (compareName === nameToCorrect) {
        return false;
      }

      let distance = levenshtein(nameToCorrect, compareName);

      // Substring Bonus: If one word entirely contains the other, we can artificially lower the
      // distance by 1 to be more forgiving.
      if (
        (compareName.startsWith(nameToCorrect) || nameToCorrect.startsWith(compareName))
        && distance > 0
      ) {
        distance -= 1;
      }

      // Check against our dynamic threshold
      if (distance >= 0 && distance <= maxDistance && distance < minDistanceFound) {
        minDistanceFound = distance;
        closestItem = item;
      }
    }

    if (closestItem) {
      itemToCorrect.overwrittenName = itemToCorrect.name;
      itemToCorrect.name = closestItem.name;
    }

    return !!closestItem;
  }

  function handleRestore(index: number) {
    if (items[index].overwrittenName) {
      items[index].name = items[index].overwrittenName;
      items[index].overwrittenName = undefined;
      // After a correction is reverted, we don't want that field to be corrected again (unless that
      // field is modified later).
      items[index].preventCorrection = true;
    }
  }

  let correctionDialog: HTMLDialogElement;
  let correctionItemIndex: number | undefined = $state();
</script>

<dialog bind:this={correctionDialog}>
  <p>
    { m.shopping_add_items_original_value({ value: items[correctionItemIndex!]?.overwrittenName ?? '' }) }
  </p>
  <form method="dialog">
    <button onclick={() => handleRestore(correctionItemIndex!)}>
      { m.shopping_add_items_original_value_revert() }
    </button>
    <button>{m.generic_close()}</button>
  </form>
</dialog>

<article>
  <div class="header">
    <h4>{m.shopping_add_items()}</h4>
  </div>
  <ApiForm {submitAction} submitButtonHidden {onSuccess}>
    <table class="items-table">
      <thead>
      <tr>
        <th class="col-amount">{ m.generic_amount() }</th>
        <th>{ m.generic_name() }</th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      {#each items as item, index (index)}
        <tr>
          <td>
            <input
              name="amounts"
              bind:this={amountRefs[index]}
              type="text"
              bind:value={item.amount}
              onkeydown={(e) => handleKeyDown(e, index, 'amount')}
            />
          </td>
          <td>
            <input
              name="names"
              bind:this={nameRefs[index]}
              type="text"
              bind:value={item.name}
              onkeydown={(e) => handleKeyDown(e, index, 'name')}
            />
          </td>
          <td class="actions-cell">
            {#if !!item.overwrittenName}
              <button
                type="button"
                class:warning={!!item.overwrittenName}
                onclick={() => {
                  correctionItemIndex = index;
                  correctionDialog.showModal();
                }}
              >
                <CircleAlert />
              </button>
            {/if}
            <button
              type="button"
              tabindex="-1"
              onclick={() => deleteItem(index)}
            >
              <Trash2 />
            </button>
          </td>
        </tr>
      {/each}
      <tr>
        <td>
          <button type="button" onclick={addEmptyRow}>
            <CirclePlus />
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    {#if data.suggestions.length > 0}
      {m.shopping_add_items_suggestions()}
      <div class="suggestion-box">
        {#each data.suggestions as suggestion(suggestion.name)}
          {#if suggestionNotPresent(suggestion.name)}
            <button class="tertiary" type="button" onclick={() => addSuggestion(suggestion.name)}>
              {suggestion.name}
            </button>
          {/if}
        {/each}
      </div>
    {/if}
    {#snippet additionalButtons()}
      <button type="submit" onclick={applyCorrections}>{ m.generic_save() }</button>
    {/snippet}
  </ApiForm>
</article>

<style>
    dialog {
        white-space: pre-line;
    }

    .header {
        display: flex;
        justify-content: space-between;
    }

    .items-table {
        margin-bottom: 1rem;
        margin-top: 1rem;
    }

    .col-amount {
        width: 5rem;
    }

    .actions-cell {
        display: flex;
    }

    .suggestion-box {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
</style>

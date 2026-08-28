<script lang="ts">
  import { type ShoppingCategoryWithRelation, type ShoppingItem } from '$lib/backend/db/schema';

  // unfiltered implies that all items should be displayed, including deactivated ones.
  let { categories, unfiltered = false, value = $bindable([]) } = $props();

  const filterActive = (shoppingItems: ShoppingItem[], active: boolean = true): ShoppingItem[] =>
    shoppingItems.filter((item) => item.active === active);

  const shouldBeDisplayed = (category: ShoppingCategoryWithRelation) => {
    // Unfiltered categories are always displayed.
    if (unfiltered) {
      return true;
    }

    // Otherwise the category must include at least one active item.
    return filterActive(category.shoppingItems).length > 0;
  };
</script>

{#each categories as category (category.id)}
  {#if shouldBeDisplayed(category) }
    <article>
      <h2>{category.name}</h2>
      <div class="action-row">
        {#each filterActive(category.shoppingItems) as item (item.id)}
          <label>
            <input type="checkbox" name="items" value={item.id} bind:group={value} />
            {item.amount} {item.name}
          </label>
        {/each}
        {#if unfiltered}
          {#each filterActive(category.shoppingItems, false) as item (item.id)}
            <label class="warning">
              <input type="checkbox" name="items" value={item.id} bind:group={value} />
              {item.name}
            </label>
          {/each}
        {/if}
      </div>
    </article>
  {/if}
{/each}

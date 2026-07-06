<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { priceFormatter, shortDateFormatter } from '$lib/utils/formatter';

  let { data } = $props();

  let lastPurchaseDate = $derived(
    !data.last_purchase_date
      ? null
      : shortDateFormatter.format(new Date(data.last_purchase_date))
  );
</script>

<article>
  <h2>{ m.navigation_shopping() }</h2>
  <p>
    { m.dashboard_shopping_count({ count: data.shopping_item_count }) }
  </p>
  {#if lastPurchaseDate}
    <p>
      { m.dashboard_shopping_last_purchase({ date: lastPurchaseDate }) }
    </p>
  {/if}
</article>

<article>
  <h2>{ m.navigation_schedule() }</h2>
  <p>{ m.dashboard_schedule_count({ count: data.due_task_count }) }</p>
</article>

<article>
  <h2>{ m.balance() }</h2>
  {#if data.user_debts.length === 0}
    <p>{ m.balance_none() }</p>
  {:else }
    {#each data.user_debts as userDebt (userDebt.creditor.id)}
      <div>
        <h4>{m.balance_owed({ user: userDebt.creditor.username })}</h4>
        <ul>
          {#each userDebt.debtorData as debtorEntry (debtorEntry.debtor.id)}
            <li>
              {m.balance_owed_debtor({
                amount: priceFormatter.format(debtorEntry.amount / 100),
                debtor: debtorEntry.debtor.username
              })}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  {/if}
</article>

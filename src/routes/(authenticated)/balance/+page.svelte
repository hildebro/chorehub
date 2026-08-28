<script lang="ts">
  import { resolve } from '$app/paths';
  import type { BalanceEntry } from '$lib/backend/db/schema';
  import * as m from '$lib/paraglide/messages.js';
  import { dateFormatter, priceFormatter } from '$lib/utils/formatter';

  let { data } = $props();

  const getLabel = (balanceEntry: BalanceEntry) => {
    if (balanceEntry.name) {
      return balanceEntry.name;
    }

    return m.balance_no_name_label();
  };
</script>

<div class="action-bar">
  <a role="button" href={resolve('/balance/add')}>{ m.balance_expense_add() }</a>
</div>

<article>
  <h2>{m.balance()}</h2>
  {#if data.userDebts.length === 0}
    <p>{ m.balance_none() }</p>
  {/if}
  {#each data.userDebts as userDebt (userDebt.creditor.id)}
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
</article>

<h2 class="headline">{ m.balance_expenses() }</h2>
{#each data.entries as entry (entry.id)}
  <article>
    <div class="action-bar">
      <a role="button" href={resolve('/(authenticated)/balance/[entry]', {entry: entry.id})}>
        {m.generic_edit()}
      </a>
    </div>
    <div>
      {getLabel(entry)}
      <b>{priceFormatter.format(entry.price / 100)}</b>
    </div>
    <span>{entry.user.username}</span>
    <footer>
      <span>{dateFormatter.format(entry.date)}</span>
    </footer>
  </article>
{/each}

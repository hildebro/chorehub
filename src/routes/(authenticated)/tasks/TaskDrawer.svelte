<script lang="ts">
  import { Check, Pencil } from 'lucide-svelte';
  import { SvelteDate } from 'svelte/reactivity';
  import { resolve } from '$app/paths';
  import * as m from '$lib/paraglide/messages.js';
  import type { FrontendTask } from '$lib/server/api/task';
  import { shortDateFormatter } from '$lib/utils/formatter';

  type TaskPreset = 'Due' | 'Upcoming' | 'Done';

  let { tasks, preset, onMarkAsDone }: {
    tasks: FrontendTask[],
    preset: TaskPreset,
    onMarkAsDone: (task: FrontendTask) => void,
  } = $props();

  function getDueCardPreset(task: FrontendTask): string {
    if (task.done) {
      return '';
    }

    if (!task.dueDate) {
      return '';
    }

    const today = new SvelteDate();
    today.setHours(0, 0, 0, 0);
    const yesterday = new SvelteDate(today);
    yesterday.setDate(today.getDate() - 1); // Get yesterday's date

    const dueDate = new SvelteDate(task.dueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);

    // Assign color based on due date relative to today
    if (dueDate.getTime() < yesterday.getTime()) {
      return 'error'; // Red for tasks due before yesterday
    } else if (dueDate.getTime() < today.getTime()) {
      return 'warning'; // Yellow for due yesterday
    } else {
      return ''; // Green for due today
    }
  }

  // Function to format date strings for display (e.g., "May 2, 2025")
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A'; // Handle null or undefined dates
    try {
      return shortDateFormatter.format(new Date(dateString + 'T00:00:00')); // Treat as local date
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Invalid Date'; // Fallback for parsing errors
    }
  }

  function getSummary(preset: TaskPreset) {
    switch (preset) {
      case 'Due':
        return m.schedule_due_tasks();
      case 'Upcoming':
        return m.schedule_upcoming_tasks();
      case 'Done':
        return m.schedule_completed_tasks();
    }
  }
</script>

<details open={preset === 'Due'}>
  <summary>{getSummary(preset)}</summary>
  {#if tasks.length === 0}
    { m.schedule_tasks_empty() }
  {/if}
  {#each tasks as task (task.id)}
    <div class={getDueCardPreset(task)}>
      <h4>{task.name}</h4>
      {#if !task.done}
        <div>{ m.schedule_assignee() }: {task.dueUser?.username ?? 'N/A'}</div>
        <p>
          <strong>{ m.schedule_due_since() }:</strong> {formatDate(task.dueDate)}
          {#if task.endDate}
            <br />
            <strong>{ m.schedule_end_date() }:</strong> {formatDate(task.endDate)}
          {/if}
        </p>
        <div class="action-row">
          <a class="icon-button" role="button" href={resolve('/(authenticated)/tasks/[task]', {task: task.id})}>
            <Pencil size={16} />
            { m.generic_edit() }
          </a>
          {#if preset === 'Due'}
            <button class="icon-button" onclick={() => onMarkAsDone(task)}>
              <Check size={16} />
              { m.schedule_task_complete() }
            </button>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</details>

<style>
    details > div {
        padding: 0.5rem;
        border: var(--default-border-width) solid var(--border-main);
        border-color: var(--color-surface-500);
    }

    details > div.warning {
        background-color: var(--color-warning-100);
        border-color: var(--color-warning-100);
        color: var(--color-warning-contrast-300);
    }

    details > div.error {
        background-color: var(--color-error-100);
        border-color: var(--color-error-100);
        color: var(--color-error-contrast-300);
    }
</style>

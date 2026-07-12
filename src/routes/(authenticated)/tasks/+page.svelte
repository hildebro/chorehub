<script lang="ts">
  import { Check, Pencil, Undo2 } from 'lucide-svelte';
  import { SvelteDate } from 'svelte/reactivity';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { TaskWithRelation } from '$lib/server/db/schema';
  import { shortDateFormatter } from '$lib/utils/formatter';

  let { data } = $props();

  type FrontendTaskWithRelation = Omit<TaskWithRelation, 'createdAt'> & {
    createdAt: string;
    dueDate: string | null;
  };

  function getDueCardPreset(task: FrontendTaskWithRelation): string {
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

  function openModalForTask(task: FrontendTaskWithRelation) {
    markAsDoneTaskId = task.id;
    markAsDoneUserId = task.dueUser?.id || '';
    doneDialog.showModal();
  }

  function closeModal() {
    doneDialog.close();
  }

  let doneDialog: HTMLDialogElement;

  let markAsDoneTaskId = $state('');
  let markAsDoneUserId = $state('');

  async function markAsDone() {
    const client = getApiClient();
    return client.api.tasks.done.$post({
      json: { taskId: markAsDoneTaskId, userId: markAsDoneUserId }
    });
  }
</script>

<dialog bind:this={doneDialog}>
  <ApiForm
    submitAction={markAsDone}
    onSuccess={closeModal}
    {additionalButtons}
  >
    <input type="hidden" name="taskId" value={markAsDoneTaskId} />
    <ApiFormItem
      label={m.schedule_done_who()}
      name="userId"
      type="select"
      bind:value={markAsDoneUserId}
    >
      <option value="" selected>{ m.generic_required() }</option>
      {#each data.users as user (user.id)}
        <option value={user.id}>{user.username}</option>
      {/each}
    </ApiFormItem>
  </ApiForm>
  {#snippet additionalButtons()}
    <button type="button" onclick={closeModal}>
      <Undo2 size={12} />
      { m.generic_cancel() }
    </button>
  {/snippet}
</dialog>

<div class="action-bar">
  <a role="button" href={resolve('/tasks/add')}>{ m.schedule_task_add() }</a>
</div>
<h2 class="headline">{ m.schedule_due_tasks() }</h2>
{#if data.dueTasks.length === 0}
  <article>{ m.schedule_due_tasks_empty() }</article>
{/if}
{#each data.dueTasks as task (task.id)}
  <article class={getDueCardPreset(task)}>
    <div class="action-bar">
      <a class="icon-button" role="button" href={resolve('/(authenticated)/tasks/[task]', {task: task.id})}>
        <Pencil size={16} />
        { m.generic_edit() }
      </a>
      <button class="icon-button" onclick={() => openModalForTask(task)}>
        <Check size={16} />
        { m.schedule_done() }
      </button>
    </div>
    <h3>{task.name}</h3>
    <hr />
    <div>
      <div>{ m.schedule_assignee() }: {task.dueUser?.username ?? 'N/A'}</div>
      <p>
        <strong>{ m.schedule_due_since() }:</strong> {formatDate(task.dueDate)}
        {#if task.endDate}
          <br />
          <strong>{ m.schedule_end_date() }:</strong> {formatDate(task.endDate)}
        {/if}
      </p>
    </div>
  </article>
{/each}

{#if data.upcomingTasks.length > 0}
  <h2 class="headline">{ m.schedule_upcoming_tasks() }</h2>
  {#each data.upcomingTasks as task (task.id)}
    <article>
      <div class="action-bar">
        <a class="icon-button" role="button" href={resolve('/(authenticated)/tasks/[task]', {task: task.id})}>
          <Pencil size={16} />
          { m.generic_edit() }
        </a>
      </div>
      <h3>{task.name}</h3>
      <hr />
      <div>
        <div>{ m.schedule_assignee() }: {task.dueUser?.username}</div>
        <p>
          <strong>{ m.schedule_upcoming_at() }:</strong> {formatDate(task.dueDate)}
          {#if task.endDate}
            <br />
            <strong>{ m.schedule_end_date() }:</strong> {formatDate(task.endDate)}
          {/if}
        </p>
      </div>
    </article>
  {/each}
{/if}

{#if data.completedTasks.length > 0}
  <h2 class="headline">{ m.schedule_completed_tasks() }</h2>
  {#each data.completedTasks as task (task.id)}
    <article>
      <h3>{task.name}</h3>
    </article>
  {/each}
{/if}

<script lang="ts">
  import { Undo2 } from 'lucide-svelte';
  import TaskDrawer from './TaskDrawer.svelte';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { FrontendTask } from '$lib/server/api/task';

  let { data } = $props();

  function openModalForTask(task: FrontendTask) {
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
      label={m.schedule_task_complete_user()}
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
<TaskDrawer
  tasks={data.dueTasks}
  preset='Due'
  onMarkAsDone={(task: FrontendTask) => openModalForTask(task)}
/>
{#if data.upcomingTasks.length > 0}
  <TaskDrawer
    tasks={data.upcomingTasks}
    preset='Upcoming'
    onMarkAsDone={(task: FrontendTask) => openModalForTask(task)}
  />
{/if}
{#if data.completedTasks.length > 0}
  <TaskDrawer
    tasks={data.completedTasks}
    preset='Done'
    onMarkAsDone={(task: FrontendTask) => openModalForTask(task)}
  />
{/if}

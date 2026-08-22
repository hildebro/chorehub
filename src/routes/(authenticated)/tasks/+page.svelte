<script lang="ts">
  import { Undo2 } from 'lucide-svelte';
  import TaskDrawer from './TaskDrawer.svelte';
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import type { FrontendTask } from '$lib/server/api/task';
  import { Assignment } from '$lib/utils/taskHelper';

  let { data } = $props();

  function openModalForTask(task: FrontendTask) {
    taskToComplete = task;
    if (!task.dueUserId) {
      taskToComplete.dueUserId = '';
    }

    doneDialog.showModal();
  }

  function closeModal() {
    doneDialog.close();
  }

  let doneDialog: HTMLDialogElement;

  let taskToComplete: FrontendTask | undefined = $state();

  let showConfetti = $state(false);

  function onSuccess() {
    closeModal();
    showConfetti = true;
  }

  async function markAsDone() {
    const client = getApiClient();
    return client.api.tasks.done.$post({
      json: { taskId: taskToComplete!.id, userId: taskToComplete!.dueUserId }
    });
  }

  const doneDialogEmptyUserLabel = () => {
    if (!taskToComplete) {
      return '';
    }

    if (
      taskToComplete.assignment === Assignment.Everyone
      || taskToComplete.assignment === Assignment.Someone
    ) {
      return m.generic_required();
    }

    return '';
  }
</script>

<Confetti bind:show={showConfetti} />

<dialog bind:this={doneDialog}>
  {#if taskToComplete}
    <div>
      <h3>{ taskToComplete.name }</h3>
      <p>{ taskToComplete.description }</p>
    </div>
    <ApiForm
      submitAction={markAsDone}
      {onSuccess}
      {additionalButtons}
    >
      <ApiFormItem
        label={m.schedule_task_complete_user()}
        name="userId"
        type="select"
        bind:value={taskToComplete.dueUserId}
      >
        <option value="" selected>{ doneDialogEmptyUserLabel() }</option>
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
  {/if}
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

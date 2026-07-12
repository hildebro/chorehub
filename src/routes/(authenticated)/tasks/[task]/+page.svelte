<script lang="ts">
  import { resolve } from '$app/paths';
  import { getApiClient } from '$lib/apiClient';
  import ApiForm from '$lib/components/ApiForm.svelte';
  import ApiFormItem from '$lib/components/ApiFormItem.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { Assignment, TaskType, Weekday } from '$lib/utils/taskHelper';

  let { data } = $props();

  let id = $derived(data.task?.id);
  let name = $derived(data.task?.name ?? '');
  let description = $derived(data.task?.description ?? '');
  let dueDate = $derived(data.task?.dueDate ?? '');
  let dueUserId = $derived(data.task?.dueUserId ?? '');
  let isRepeating = $derived((data.task?.type ?? TaskType.Single) === TaskType.Repeating);
  let type = $derived(isRepeating ? TaskType.Repeating : TaskType.Single);
  let weekday = $derived(data.task?.dueWeekday ?? '');
  let interval = $derived(data.task?.dueInterval ?? null);
  let assignment = $derived(data.task?.assignment ?? '');
  let endDate = $derived(data.task?.endDate ?? '');

  async function saveTask() {
    const client = getApiClient();
    return client.api.tasks.$post({
      json: {
        id,
        name,
        description,
        dueDate,
        dueUserId,
        type,
        weekday: weekday.length === 0 ? null : weekday as Weekday,
        interval,
        assignment: assignment.length === 0 ? null : assignment as Assignment,
        endDate
      }
    });
  }

  function translateWeekday(weekday: Weekday) {
    switch (weekday) {
      case Weekday.Monday:
        return m.schedule_weekday_mon();
      case Weekday.Tuesday:
        return m.schedule_weekday_tue();
      case Weekday.Wednesday:
        return m.schedule_weekday_wed();
      case Weekday.Thursday:
        return m.schedule_weekday_thu();
      case Weekday.Friday:
        return m.schedule_weekday_fri();
      case Weekday.Saturday:
        return m.schedule_weekday_sat();
      case Weekday.Sunday:
        return m.schedule_weekday_sun();
    }
  }

  function translateAssignment(assignment: Assignment) {
    switch (assignment) {
      case Assignment.Everyone:
        return m.schedule_assignment_everyone();
      case Assignment.Someone:
        return m.schedule_assignment_someone();
      case Assignment.Noone:
        return m.schedule_assignment_noone();
    }
  }
</script>

<article>
  <h2>
    {#if data.task}
      { m.schedule_task_update() }
    {:else }
      { m.schedule_task_add() }
    {/if}
  </h2>
  <ApiForm submitAction={saveTask} onSuccess={resolve('/tasks')}>
    <input type="hidden" name="id" value={id}>
    <ApiFormItem
      label={m.generic_name()}
      name="name"
      bind:value={name}
    />
    <ApiFormItem
      label={m.schedule_task_description()}
      name="description"
      type="textarea"
      bind:value={description}
    />
    <ApiFormItem
      label={m.schedule_assignee()}
      name="assignee"
      type="select"
      bind:value={dueUserId}
    >
      <option value="" selected></option>
      {#each data.users as user (user.id)}
        <option value={user.id}>{user.username}</option>
      {/each}
    </ApiFormItem>
    <ApiFormItem
      label={ m.schedule_due_date() }
      name="dueDate"
      type="date"
      bind:value={dueDate}
    />
    <ApiFormItem
      label={m.schedule_task_repeating()}
      name="type"
      type="checkbox"
      bind:value={isRepeating}
    />
    {#if isRepeating}
      <ApiFormItem
        label={m.schedule_weekday()}
        name="weekday"
        type="select"
        bind:value={weekday}
      >
        <option value="" selected>{ m.generic_required() }</option>
        {#each Object.values(Weekday) as weekdayOption (weekdayOption)}
          <option value={weekdayOption}>{translateWeekday(weekdayOption)}</option>
        {/each}
      </ApiFormItem>
      <div class="label">{ m.schedule_interval() }</div>
      <div class="interval-row">
        <span>{ m.schedule_interval_every()}</span>
        <ApiFormItem
          label=""
          name="interval"
          bind:value={interval}
        />
        <span>{ m.schedule_interval_weeks() }</span>
      </div>
      <ApiFormItem
        label={m.schedule_assignment()}
        name="assignment"
        type="select"
        bind:value={assignment}
      >
        <option value="" selected>{ m.generic_required() }</option>
        {#each Object.values(Assignment) as assignmentOption (assignmentOption)}
          <option value={assignmentOption}>{translateAssignment(assignmentOption)}</option>
        {/each}
      </ApiFormItem>
      <ApiFormItem
        label={ m.schedule_end_date() }
        name="endDate"
        type="date"
        bind:value={endDate}
      />
      {#if data.task?.completions}
        <div>{ m.schedule_completions() }</div>
        <ul>
          {#each data.users as user (user.id)}
            <li>
              {user.username}: { data.task.completions?.filter(completion => completion.userId === user.id).length }
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </ApiForm>
</article>

<style>
    .interval-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.25rem;
    }
</style>

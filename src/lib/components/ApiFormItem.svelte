<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import MoneyInput from '$lib/MoneyInput.svelte';

  let {
    label,
    name,
    value = $bindable(),
    files = $bindable(),
    disabled = false,
    accept,
    type = 'text',
    error = '',
    onchange,
    children
  }: {
    label: string;
    name: string;
    value?: unknown;
    files?: FileList | null;
    disabled?: boolean;
    accept?: string;
    type?: 'text' | 'textarea' | 'password' | 'number' | 'select' | 'money' | 'hidden' | 'date' | 'file' | 'checkbox';
    error?: string;
    onchange?: (event: Event) => void;
    children?: Snippet;
  } = $props();

  // Retrieve the shared state from ApiForm (fallback to empty object if used outside ApiForm)
  const formState = getContext<{ errors: Record<string, string> }>('api-form-context');

  let displayError = $derived(error || formState?.errors?.[name] || '');
</script>

<div class="form-item">
  {#if type !== 'checkbox'}
    <label for={name}>{label}</label>
  {/if}
  {#if type === 'select'}
    <select
      class="input"
      class:error-border={!!displayError}
      {name}
      id={name}
      bind:value
      {disabled}
      {onchange}
    >
      <!-- Conditional to make the type-check happy. Even though select without children should not happen. -->
      {#if children}
        {@render children()}
      {/if}
    </select>
  {:else if type === 'money'}
    <MoneyInput
      {name}
      id={name}
      bind:value={value as number}
      hasError={!!displayError}
      {disabled}
    />
  {:else if type === 'file'}
    <input
      class="input"
      class:error-border={!!displayError}
      type="file"
      {name}
      id={name}
      {accept}
      bind:files
      {disabled}
    />
  {:else if type === 'checkbox'}
    <label for={name} class:error={!!displayError}>
      <input
        type="checkbox"
        {name}
        id={name}
        bind:checked={value as boolean}
        {disabled}
      />
      {label}
    </label>
  {:else if type === 'textarea'}
    <textarea
      class="input"
      class:error-border={!!displayError}
      {name}
      id={name}
      bind:value
      {disabled}
    >
    </textarea>
  {:else}
    <input
      class="input"
      class:error-border={!!displayError}
      {type}
      {name}
      id={name}
      bind:value
      {disabled}
    />
  {/if}
  <div class="error-spacer">
    {#if displayError}
      <span class="error-text">{displayError}</span>
    {/if}
  </div>
</div>

<style>
    .form-item {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.25rem;
    }

    .form-item :global(.input.error-border) {
        border-color: var(--btn-error-bg);
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .form-item :global(.input.error-border:focus-visible) {
        outline-color: var(--btn-error-bg);
    }

    .error-spacer {
        min-height: 1.85rem;
    }

    .error-text {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;

        background-color: var(--btn-error-bg);
        color: var(--btn-error-text);
        padding: 0.35rem 0.5rem;

        border-radius: 0 0 var(--radius-base, 0.25rem) var(--radius-base, 0.25rem);

        line-height: 1.2;
        animation: fade-in 0.2s ease-out;
    }

    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(-2px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>

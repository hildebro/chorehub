<script lang="ts">
  import '../app.css';
  import { App } from '@capacitor/app';
  import type { PluginListenerHandle } from '@capacitor/core';
  import { Capacitor } from '@capacitor/core';
  import { StatusBar } from '@capacitor/status-bar';
  import { onMount } from 'svelte';
  import AttentionAction from './AttentionAction.svelte';
  import HelpAction from './HelpAction.svelte';
  import LanguageAction from './LanguageAction.svelte';
  import MenuAction from './MenuAction.svelte';
  import ThemeAction from './ThemeAction.svelte';
  import { page } from '$app/state';
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import * as m from '$lib/paraglide/messages.js';
  import { addToast } from '$lib/stores/toast';

  let { children } = $props();
  let lastBackPressed = 0;

  let loggedInUser = $derived(page.data.logged_in_user);

  async function initCapacitor(onRegister: (listener: PluginListenerHandle) => void) {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await StatusBar.setOverlaysWebView({ overlay: true });

    const listener = await App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();

        return;
      }

      const now = Date.now();
      if (now - lastBackPressed < 2000) {
        App.exitApp();
      } else {
        lastBackPressed = now;
        addToast({
          message: 'Press back again to exit',
          type: 'primary',
          duration: 2000
        });
      }
    });

    onRegister(listener);
  }

  onMount(() => {
    let backButtonListener: PluginListenerHandle | undefined;
    let isUnmounted = false;

    initCapacitor((listener) => {
      if (isUnmounted) {
        listener.remove();
      } else {
        backButtonListener = listener;
      }
    });

    return () => {
      isUnmounted = true;
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  });
</script>

<ToastContainer />

<svelte:head>
  <title>Laneh</title>
</svelte:head>

<div class="app-shell">
  <header>
    <div class="header-inner">
      <div>
        { m.header_head() }
      </div>
      <div class="header-action-container">
        <AttentionAction attentionRequired={loggedInUser && !loggedInUser.helpDisclaimerDismissed} />
        <HelpAction help_text={page.data.help_text} />
        <ThemeAction />
        <LanguageAction />
        <MenuAction logged_in_user={page.data.logged_in_user} />
      </div>
    </div>
  </header>
  {@render children()}
</div>

<style>
    .app-shell {
        min-height: 100vh;
    }

    header {
        position: sticky;
        top: 0;
        z-index: 100;
        background-color: var(--bg-app);
        border-bottom: var(--default-border-width) solid var(--border-main);
        padding-top: env(safe-area-inset-top, 1rem);
    }

    .header-inner {
        width: 100%;
        max-width: var(--max-width);
        margin: 0 auto;
        padding: 0.3rem;
        color: var(--text-heading);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-action-container {
        display: flex;
        align-items: start;
    }

    .header-inner div {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    @media (max-width: 23.5rem) {
        .header-inner {
            padding-inline: 0.5rem;
        }
    }
</style>

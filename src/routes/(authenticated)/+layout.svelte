<script lang="ts">
  import { LoaderCircle } from 'lucide-svelte';
  import Navigation from './Navigation.svelte';
  import { invalidateAll } from '$app/navigation';

  let { children, data } = $props();

  // --- Pull to Refresh State ---
  const resistance = 0.3;
  let startY = $state(0);
  let currentY = $state(0);
  let pulling = $state(false);
  let rotateDeg = $state(0);
  let shouldRefresh = $state(false);
  let translateY = $state(0);
  let isRefreshing = $state(false);

  const touchStart = (event: TouchEvent) => {
    // Only engage if we are at the very top of the page
    if (window.scrollY === 0) {
      startY = event.touches[0].clientY;
    } else {
      startY = 0;
    }
  };

  const touchMove = (event: TouchEvent) => {
    if (startY === 0 || isRefreshing) return;

    currentY = event.touches[0].clientY;
    const diff = currentY - startY;

    // Only pull if swiping down
    if (diff > 20) {
      pulling = true;
      rotateDeg = diff * 1;

      // Calculate the pull, but never let it exceed 60px
      const calculatedPull = diff * resistance;
      translateY = Math.min(calculatedPull, 60);

      shouldRefresh = rotateDeg > 180;

      // Prevent standard browser pull-to-refresh/overscroll
      if (event.cancelable) event.preventDefault();
    } else {
      pulling = false;
    }
  };

  const touchEnd = async () => {
    if (!pulling) return;

    if (shouldRefresh) {
      rotateDeg = 0;
      isRefreshing = true;
      translateY = 60;

      await invalidateAll();

      // Small delay so the user registers the refresh actually happened
      setTimeout(() => {
        translateY = 0;
        pulling = false;
        shouldRefresh = false;
        isRefreshing = false;
      }, 500);
    } else {
      // Snap back if they didn't pull far enough
      translateY = 0;
      pulling = false;
      shouldRefresh = false;
    }
  };
</script>

<main
  ontouchstart={touchStart}
  ontouchmove={touchMove}
  ontouchend={touchEnd}
>
  {#if pulling || isRefreshing}
    <div class="pull-wrapper">
      <div
        class="pull-indicator"
        style="transform: translateY({translateY}px); transition: {pulling ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'};"
      >
        <div class="loader-bg">
          <LoaderCircle
            size={24}
            style="transform: rotate({rotateDeg}deg); transition: {isRefreshing ? 'none' : 'transform 0.1s linear'}"
            class={isRefreshing ? 'animate-spin' : ''}
          />
        </div>
      </div>
    </div>
  {/if}

  {@render children()}
</main>

<footer>
  <div class="footer-inner">
    <Navigation dueTaskCount={data.due_task_count} />
  </div>
</footer>

<style>
    footer {
        position: sticky;
        bottom: 0;
        z-index: 100;
        background-color: var(--bg-app);
        border-top: var(--default-border-width) solid var(--border-main);
        padding-bottom: env(safe-area-inset-bottom, 0px);
    }

    .footer-inner {
        width: 100%;
        max-width: var(--max-width);
        margin: 0 auto;
        padding: 0.5rem 1rem;
    }

    .pull-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 150px;
        overflow: hidden;
        pointer-events: none;
        z-index: 50;
    }

    .pull-indicator {
        position: absolute;
        top: -55px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
    }

    .loader-bg {
        background-color: var(--bg-surface);
        color: var(--btn-primary-bg);
        border: var(--default-border-width) solid var(--border-main);
        border-radius: 50%;
        width: 2.75rem;
        height: 2.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 23.5rem) {
        .footer-inner {
            padding-inline: 0.5rem;
        }
    }
</style>
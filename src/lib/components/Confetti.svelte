<script lang="ts">
  let {
    show = $bindable(false),
    duration = 4000,
    count = 100
  } = $props();

  const colors = [
    'var(--btn-primary-bg)',
    'var(--btn-secondary-bg)',
    'var(--btn-tertiary-bg)',
    'var(--btn-warning-bg)',
    'var(--btn-error-bg)'
  ];

  $effect(() => {
    if (show) {
      const timer = setTimeout(() => {
        show = false;
      }, duration);

      return () => clearTimeout(timer);
    }
  });

  function getConfettiStyle() {
    const left = Math.random() * 100 + 'vw';
    const bg = colors[Math.floor(Math.random() * colors.length)];

    const animDuration = (Math.random() * 1.5 + 1.5) + 's';

    const delay = Math.random() * 1 + 's';

    const size = Math.random() * 10 + 5;

    return `left: ${left}; background-color: ${bg}; animation-duration: ${animDuration}; animation-delay: ${delay}; width: ${size}px; height: ${size * 2}px;`;
  }
</script>

{#if show}
  <div id="confetti-container">
    {#each Array.from({ length: count }, getConfettiStyle) as style (style)}
      <div class="confetti" {style}></div>
    {/each}
  </div>
{/if}

<style>
  #confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    overflow: hidden;
    z-index: 9999;
  }

  .confetti {
    position: absolute;
    top: -20px;
    /* Added ease-in so they start a bit slower and accelerate as they "fall" */
    animation: fall ease-in forwards;
  }

  @keyframes fall {
    0% {
      transform: translateY(0) rotate(0deg) rotateX(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(110vh) rotate(720deg) rotateX(360deg);
      opacity: 1;
    }
  }
</style>

(() => {
  const banner = document.querySelector('[data-update-banner]');
  const reloadBtn = document.querySelector('[data-reload]');
  let waitingWorker = null;

  function showBanner(sw) {
    waitingWorker = sw;
    if (!banner) return;
    banner.hidden = false;
  }

  reloadBtn?.addEventListener('click', () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      location.reload();
    }
  });

  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });

      if (reg.waiting) showBanner(reg.waiting);

      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            showBanner(sw);
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // avoid reload loops
        if (window.__swReloading) return;
        window.__swReloading = true;
        location.reload();
      });
    } catch (e) {
      // silent fail: do not break existing app
    }
  });
})();
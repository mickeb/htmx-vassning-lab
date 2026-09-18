// Development only -- layout.liquid includes this when NODE_ENV is not
// "production". Listens for reload events from the server (see
// src/dev-reload.ts) and refreshes the page.
(function () {
  var knownBootId = null;
  var status = document.querySelector('[data-check="reload"]');

  function setStatus(text, ok) {
    if (!status) return;
    status.textContent = text;
    if (ok) {
      status.dataset.state = 'ok';
    } else {
      delete status.dataset.state;
    }
  }

  var source = new EventSource('/__reload');

  source.addEventListener('hello', function (event) {
    if (knownBootId === null) {
      knownBootId = event.data;
      setStatus('connected', true);
      return;
    }

    // EventSource reconnected on its own and the server reports a different
    // boot id, so the server restarted while this page was open: it is stale.
    if (event.data !== knownBootId) {
      location.reload();
    }
  });

  source.addEventListener('reload', function () {
    location.reload();
  });

  source.addEventListener('error', function () {
    // Fires while the server is restarting. EventSource retries by itself.
    setStatus('reconnecting…', false);
  });
})();

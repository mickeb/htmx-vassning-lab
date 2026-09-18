// Proves that files under public/js/ are served and executing.
// Plain browser JavaScript -- no bundler, no modules, no build step.
document.addEventListener('DOMContentLoaded', function () {
  function report(name, text) {
    var el = document.querySelector('[data-check="' + name + '"]');
    if (!el) return;
    el.textContent = text;
    el.dataset.state = 'ok';
  }

  report('js', 'running');

  // app.css defines --accent on :root. If it resolves, the stylesheet was
  // fetched, parsed and applied -- not merely requested.
  var accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();

  if (accent) report('css', 'loaded');
});

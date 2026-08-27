// --- Hero demo toggle: shows/hides the real badge component on the
// mock SERP results, mirroring exactly what the actual SERP-toggle
// setting does in the extension itself (see lib/settings.js +
// content-scripts/serp-overlay.js). ---
(function () {
  const toggle = document.getElementById("demo-toggle");
  const results = document.getElementById("demo-results");
  if (!toggle || !results) return;

  function sync() {
    results.classList.toggle("is-off", !toggle.checked);
  }

  toggle.addEventListener("change", sync);
  sync();
})();

// --- Restrained scroll-reveal: sections fade/rise in once as they enter
// view. One subtle pass, not scattered per-element effects — and fully
// skipped for reduced-motion users (also handled in CSS, this just
// avoids adding the observer at all). ---
(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  const revealTargets = document.querySelectorAll(
    ".problem, .how, .pricing, .trust, .faq, .final-cta"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((el) => {
    el.classList.add("reveal-pending");
    observer.observe(el);
  });
})();

// Ibn al-Haytham tribute page — small progressive-enhancement script.
// The page works fully without this file; it only adds two light touches:
// 1) fade/rise-in animation as sections enter the viewport
// 2) a soft "light" glow that follows the cursor, echoing the pinhole theme

(function () {
  // --- Scroll reveal -------------------------------------------------
  var revealTargets = document.querySelectorAll(
    '.bio-columns p, .tl-card, .quote-wrap, .legacy-inner'
  );

  revealTargets.forEach(function (el) {
    el.classList.add('reveal');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // No IntersectionObserver support: just show everything.
    revealTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // --- Cursor light glow ----------------------------------------------
  var glow = document.querySelector('.ray-cursor');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }
})();
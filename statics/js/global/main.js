console.log("Global scripts loaded.");

// Smooth scroll to hash target on page load with highlight effect
document.addEventListener('DOMContentLoaded', function() {
  // Helper for smooth scrolling that avoids conflict with CSS scroll-behavior
  const safeSmoothScrollTo = (top) => {
    // If CSS smooth scroll is supported and active on HTML, use 'auto' to avoid conflict/stutter in Firefox
    const isCssSmoothActive = getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
    window.scrollTo({
      top: top,
      behavior: isCssSmoothActive ? 'auto' : 'smooth'
    });
  };

  if (window.location.hash) {
    const id = window.location.hash.substring(1);
    const target = document.getElementById(id);
    if (target) {
      // Small delay to ensure page is fully rendered
      setTimeout(function() {
        const offset = 50;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        safeSmoothScrollTo(top);
      }, 100);
    }
  }

  // Back to top smooth scroll
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      safeSmoothScrollTo(0);
    });
  }
});